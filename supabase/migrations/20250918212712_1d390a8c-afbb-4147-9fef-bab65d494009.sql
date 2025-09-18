-- Fix: Add public access policy to projects table for approved projects
-- This will secure the projects_public view since views inherit RLS from underlying tables

-- Add policy to allow public read access to approved projects
-- This maintains the intended functionality of the projects_public view while adding security
CREATE POLICY "Allow public read access to approved projects" 
ON public.projects 
FOR SELECT 
USING (status = 'approved' AND allows_contact = true);

-- Note: The projects_public view will now automatically respect this RLS policy
-- since views inherit the RLS policies from their underlying tables