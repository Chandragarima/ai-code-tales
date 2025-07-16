
-- Create projects table to store submitted projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  story TEXT NOT NULL,
  deeper_story TEXT,
  link TEXT NOT NULL,
  tools TEXT[] NOT NULL,
  creator_name TEXT NOT NULL,
  email TEXT NOT NULL,
  allows_contact BOOLEAN NOT NULL DEFAULT true,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reactions table to store user reactions to projects
CREATE TABLE public.project_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'rocket', 'lightbulb')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id, reaction_type)
);

-- Add Row Level Security (RLS) to projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Allow users to view approved projects and their own projects
CREATE POLICY "Users can view approved projects and their own projects" 
ON public.projects 
FOR SELECT 
USING (status = 'approved' OR auth.uid() = user_id);

-- Allow users to insert their own projects
CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS to reactions table
ALTER TABLE public.project_reactions ENABLE ROW LEVEL SECURITY;

-- Allow users to view all reactions
CREATE POLICY "Anyone can view reactions" 
ON public.project_reactions 
FOR SELECT 
USING (true);

-- Allow authenticated users to insert reactions
CREATE POLICY "Authenticated users can create reactions" 
ON public.project_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reactions
CREATE POLICY "Users can update their own reactions" 
ON public.project_reactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own reactions
CREATE POLICY "Users can delete their own reactions" 
ON public.project_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_project_reactions_project_id ON public.project_reactions(project_id);
