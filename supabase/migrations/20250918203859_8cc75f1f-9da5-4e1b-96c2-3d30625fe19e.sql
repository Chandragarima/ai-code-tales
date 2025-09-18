-- Create a secure public view for projects that excludes sensitive email data
CREATE VIEW public.projects_public AS
SELECT 
    id,
    user_id,
    name,
    description,
    story,
    deeper_story,
    link,
    tools,
    creator_name,
    screenshots,
    status,
    allows_contact,
    created_at,
    updated_at
FROM public.projects 
WHERE status = 'approved';

-- Update the existing projects table RLS policy to be more restrictive
-- Remove the current policy that allows public access to all fields including email
DROP POLICY "Users can view approved projects and their own projects" ON public.projects;

-- Create new policy: users can only see their own projects with all fields
CREATE POLICY "Users can view their own projects" ON public.projects
FOR SELECT USING (auth.uid() = user_id);

-- Create policy: authenticated users can view approved projects for messaging (email access for contact)
CREATE POLICY "Authenticated users can view approved projects for contact" ON public.projects  
FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    status = 'approved' AND 
    allows_contact = true
);