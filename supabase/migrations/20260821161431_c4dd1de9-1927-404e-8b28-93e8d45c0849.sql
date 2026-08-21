CREATE TABLE public.site_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  description text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.site_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_links TO authenticated;
GRANT ALL ON public.site_links TO service_role;
ALTER TABLE public.site_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active links" ON public.site_links FOR SELECT USING (active = true);
CREATE POLICY "Admins manage links" ON public.site_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_links (label, url, description, sort_order) VALUES
  ('Study and Struggle', 'https://www.studyandstruggle.com/', 'Abolitionist political education across Mississippi', 1),
  ('Study & Struggle Store', 'https://www.bonfire.com/store/study-and-struggle/', 'Buy merch — support the movement', 2);