-- Fix: Add RLS policies to projects_public view to prevent unrestricted scraping
-- Enable Row Level Security on the projects_public view
ALTER VIEW public.projects_public ENABLE ROW LEVEL SECURITY;

-- Add SELECT policy for public access to approved projects
-- This maintains existing functionality while adding proper security controls
CREATE POLICY "Allow public read access to approved projects" 
ON public.projects_public 
FOR SELECT 
USING (status = 'approved');

-- Explicitly deny all other operations on the view for security
-- These policies prevent any modification attempts on the view
CREATE POLICY "Deny INSERT operations" 
ON public.projects_public 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Deny UPDATE operations" 
ON public.projects_public 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny DELETE operations" 
ON public.projects_public 
FOR DELETE 
USING (false);