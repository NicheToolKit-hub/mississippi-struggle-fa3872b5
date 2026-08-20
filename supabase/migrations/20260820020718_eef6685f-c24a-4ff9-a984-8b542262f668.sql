CREATE TABLE public.donations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  donor_name text,
  donor_email text,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'usd',
  frequency text NOT NULL DEFAULT 'once' CHECK (frequency IN ('once','monthly','annual')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
  stripe_session_id text UNIQUE,
  stripe_subscription_id text,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read donations" ON public.donations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Donors read own donations" ON public.donations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX donations_created_at_idx ON public.donations (created_at DESC);
CREATE INDEX donations_status_idx ON public.donations (status);