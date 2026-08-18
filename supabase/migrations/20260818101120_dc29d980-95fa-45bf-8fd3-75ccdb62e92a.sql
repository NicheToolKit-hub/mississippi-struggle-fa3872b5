CREATE TABLE public.petition_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  zip text NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.petition_signatures TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.petition_signatures TO authenticated;
GRANT ALL ON public.petition_signatures TO service_role;

ALTER TABLE public.petition_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign the petition"
  ON public.petition_signatures FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read signatures"
  ON public.petition_signatures FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update signatures"
  ON public.petition_signatures FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete signatures"
  ON public.petition_signatures FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX petition_signatures_created_at_idx ON public.petition_signatures (created_at DESC);