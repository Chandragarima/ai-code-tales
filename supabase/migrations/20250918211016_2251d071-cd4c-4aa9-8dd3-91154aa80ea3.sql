-- Fix Security Definer View issue
-- Drop the existing view that was created with implicit SECURITY DEFINER
DROP VIEW IF EXISTS public.projects_public;

-- Create a new view with explicit SECURITY INVOKER to use querying user's permissions
-- This ensures the view uses the querying user's permissions, not the view creator's
CREATE VIEW public.projects_public
WITH (security_invoker = true) AS
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