-- Create project_views table for tracking project views
CREATE TABLE public.project_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL,
  viewer_id uuid REFERENCES auth.users(id), -- Nullable for anonymous views
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Create policies for project views
CREATE POLICY "Anyone can create view records" 
ON public.project_views 
FOR INSERT 
WITH CHECK (true); -- Allow both authenticated and anonymous users to track views

CREATE POLICY "Users can view project analytics for their own projects" 
ON public.project_views 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_views.project_id 
    AND projects.user_id = auth.uid()
  )
);

-- Create index for better performance on project_id lookups
CREATE INDEX idx_project_views_project_id ON public.project_views(project_id);
CREATE INDEX idx_project_views_created_at ON public.project_views(created_at);