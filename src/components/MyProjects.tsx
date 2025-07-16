
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectCarousel } from "./ProjectCarousel";

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  deeper_story?: string;
  link: string;
  tools: string[];
  creator_name: string;
  email: string;
  allows_contact: boolean;
  screenshots: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMyProjects();
    }
  }, [user]);

  const fetchMyProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load your projects",
          variant: "destructive",
        });
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted",
      });

      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elegant-accent mx-auto mb-4"></div>
          <p className="text-text-elegant">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-elegant mb-4">You haven't submitted any projects yet.</p>
        <Button 
          onClick={() => navigate('/submit')}
          className="bg-elegant-accent hover:bg-elegant-accent/90 text-background"
        >
          Submit Your First Project
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light text-foreground">My Projects ({projects.length})</h2>
        <Button 
          onClick={() => navigate('/submit')}
          className="bg-elegant-accent hover:bg-elegant-accent/90 text-background"
        >
          Submit New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="border-subtle-border bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-medium text-foreground">{project.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`font-light ${getStatusColor(project.status)}`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {project.screenshots && project.screenshots.length > 0 && (
                <ProjectCarousel screenshots={project.screenshots} projectName={project.name} />
              )}

              <p className="text-sm text-foreground/70 leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                {project.tools.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-light">
                    {tool}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-subtle-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(project.link, '_blank')}
                    className="border-subtle-border hover:border-elegant-accent/30 font-light"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Visit
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/edit-project/${project.id}`)}
                    className="border-subtle-border hover:border-elegant-accent/30 font-light"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-light"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="text-xs text-text-elegant">
                Created: {new Date(project.created_at).toLocaleDateString()}
                {project.updated_at !== project.created_at && (
                  <span className="ml-2">
                    • Updated: {new Date(project.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
