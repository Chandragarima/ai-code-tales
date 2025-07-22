-- First, drop the existing policies that might conflict
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;

-- Create corrected policies for project screenshots
CREATE POLICY "Public read access for project screenshots" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-screenshots');

-- Use auth.uid() IS NOT NULL instead of auth.role() = 'authenticated'
CREATE POLICY "Authenticated users can upload project screenshots" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-screenshots' AND auth.uid() IS NOT NULL);

-- Allow users to update their own screenshots
CREATE POLICY "Users can update own project screenshots" ON storage.objects 
FOR UPDATE USING (bucket_id = 'project-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own screenshots
CREATE POLICY "Users can delete own project screenshots" ON storage.objects 
FOR DELETE USING (bucket_id = 'project-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);