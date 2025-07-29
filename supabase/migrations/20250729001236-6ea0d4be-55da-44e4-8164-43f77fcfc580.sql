-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Clean up duplicate storage policies for project-screenshots
DROP POLICY IF EXISTS "Users can upload project screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own project screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own project screenshots" ON storage.objects;

-- Create cleaner storage policies for project-screenshots
CREATE POLICY "Authenticated users can upload to project-screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-screenshots' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their project screenshots"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-screenshots' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their project screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-screenshots' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);