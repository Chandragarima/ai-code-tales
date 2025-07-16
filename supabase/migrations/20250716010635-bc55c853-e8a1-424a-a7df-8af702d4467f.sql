
-- Create storage bucket for project screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-screenshots', 'project-screenshots', true);

-- Create policy to allow anyone to view screenshots (public bucket)
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-screenshots');

-- Create policy to allow authenticated users to upload screenshots
CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-screenshots' AND auth.role() = 'authenticated');

-- Create policy to allow users to update their own screenshots
CREATE POLICY "Users can update own screenshots" ON storage.objects 
FOR UPDATE USING (bucket_id = 'project-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own screenshots
CREATE POLICY "Users can delete own screenshots" ON storage.objects 
FOR DELETE USING (bucket_id = 'project-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add screenshots column to projects table
ALTER TABLE public.projects 
ADD COLUMN screenshots TEXT[] DEFAULT '{}';
