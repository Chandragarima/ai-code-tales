-- Create project_views table for analytics
CREATE TABLE IF NOT EXISTS project_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewer_id ON project_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_project_views_viewed_at ON project_views(viewed_at);

-- Enable RLS
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own project views" ON project_views
  FOR SELECT USING (viewer_id = auth.uid());

CREATE POLICY "Anyone can insert project views" ON project_views
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON project_views TO authenticated;
GRANT ALL ON project_views TO anon; 