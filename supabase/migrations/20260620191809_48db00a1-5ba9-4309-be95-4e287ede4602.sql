
-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Profiles (admin/staff identity) =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- shared updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== Submissions (public intake, awaiting review) =====
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'profile',
  status text NOT NULL DEFAULT 'pending',
  title text,
  body text,
  person_name text,
  facility text,
  year int,
  media_kind text,
  media_url text[] NOT NULL DEFAULT '{}',
  embed_url text,
  submitter_name text,
  submitter_email text,
  review_note text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit"
  ON public.submissions FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending');
CREATE POLICY "Admins read submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update submissions"
  ON public.submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete submissions"
  ON public.submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ===== Published prisoner profiles =====
CREATE TABLE public.prisoner_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  facility text,
  bio text,
  photo_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.prisoner_profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.prisoner_profiles TO authenticated;
GRANT ALL ON public.prisoner_profiles TO service_role;
ALTER TABLE public.prisoner_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published profiles"
  ON public.prisoner_profiles FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage profiles"
  ON public.prisoner_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER set_prisoner_profiles_updated_at
  BEFORE UPDATE ON public.prisoner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== Profile showcase items =====
CREATE TABLE public.profile_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.prisoner_profiles(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'accomplishment',
  title text NOT NULL,
  description text,
  media_url text,
  year int,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.profile_items TO authenticated;
GRANT ALL ON public.profile_items TO service_role;
ALTER TABLE public.profile_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published items"
  ON public.profile_items FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage items"
  ON public.profile_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Media posts (podcast / video) =====
CREATE TABLE public.media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'podcast',
  source text NOT NULL DEFAULT 'embed',
  file_url text,
  embed_url text,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_posts TO authenticated;
GRANT ALL ON public.media_posts TO service_role;
ALTER TABLE public.media_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published media"
  ON public.media_posts FOR SELECT TO anon, authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage media"
  ON public.media_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Volunteer / in-kind offers =====
CREATE TABLE public.volunteer_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_type text NOT NULL DEFAULT 'time',
  name text NOT NULL,
  email text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.volunteer_offers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.volunteer_offers TO authenticated;
GRANT ALL ON public.volunteer_offers TO service_role;
ALTER TABLE public.volunteer_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can offer help"
  ON public.volunteer_offers FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins read offers"
  ON public.volunteer_offers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update offers"
  ON public.volunteer_offers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete offers"
  ON public.volunteer_offers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ===== Contact messages =====
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can contact"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "Admins read messages"
  ON public.contact_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update messages"
  ON public.contact_messages FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages"
  ON public.contact_messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
