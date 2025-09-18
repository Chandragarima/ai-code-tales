-- Fix: Remove email column from projects_public view to prevent exposure of creator emails
-- This maintains public project access while protecting personal information

-- Drop the existing view
DROP VIEW IF EXISTS public.projects_public;

-- Recreate the view without the email column for security
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
    -- Note: email column is intentionally excluded to protect creator privacy
FROM public.projects 
WHERE status = 'approved';