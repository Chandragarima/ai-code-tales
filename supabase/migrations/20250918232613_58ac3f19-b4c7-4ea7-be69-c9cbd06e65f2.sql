-- Fix: Remove public read access to projects table to prevent email exposure
-- The projects_public view already provides public access to project data without emails

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Allow public read access to approved projects" ON public.projects;

-- Keep only authenticated access and user's own projects access
-- The projects_public view will handle public project display without exposing emails