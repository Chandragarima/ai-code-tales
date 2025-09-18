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

-- Enable RLS on the view
ALTER VIEW public.projects_public SET (security_invoker = on);

-- Create RLS policy for the public view - anyone can view approved projects (without email)
CREATE POLICY "Anyone can view public projects" ON public.projects_public
FOR SELECT USING (true);

-- Update the existing projects table policy to be more restrictive
-- Remove the current policy that allows public access to all fields including email
DROP POLICY "Users can view approved projects and their own projects" ON public.projects;

-- Create new policy that only allows users to see their own projects with all fields
CREATE POLICY "Users can view their own projects with all fields" ON public.projects
FOR SELECT USING (auth.uid() = user_id);

-- Create policy for project owners to manage their projects
CREATE POLICY "Users can view projects for contact purposes" ON public.projects  
FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    status = 'approved' AND 
    allows_contact = true
);