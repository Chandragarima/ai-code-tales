-- Create storage bucket for project screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-screenshots', 'project-screenshots', true);