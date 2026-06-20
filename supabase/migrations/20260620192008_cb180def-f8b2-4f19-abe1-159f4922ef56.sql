
-- Lock down trigger function from direct execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for the private submission-uploads bucket
CREATE POLICY "Anyone can upload submission files"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'submission-uploads');

CREATE POLICY "Admins read submission files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'submission-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update submission files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'submission-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete submission files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'submission-uploads' AND public.has_role(auth.uid(), 'admin'));
