
-- Add status field to projects table for approval workflow
ALTER TABLE public.projects 
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add index for better performance when filtering by status
CREATE INDEX idx_projects_status ON public.projects(status);

-- Update RLS policy to only show approved projects to public, but allow users to see their own projects regardless of status
DROP POLICY "Anyone can view projects" ON public.projects;

CREATE POLICY "Users can view approved projects and their own projects" 
ON public.projects 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = user_id);

-- Add policy for admins to view all projects (you'll need to implement admin roles separately)
-- For now, this allows viewing all projects if needed for moderation
CREATE POLICY "Allow viewing all projects for moderation" 
ON public.projects 
FOR SELECT 
USING (true);

-- Disable the previous policy and enable the more restrictive one
DROP POLICY "Allow viewing all projects for moderation" ON public.projects;

CREATE POLICY "Public can view approved projects only" 
ON public.projects 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = user_id);
