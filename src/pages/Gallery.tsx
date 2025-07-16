
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { GalleryHeader } from "@/components/GalleryHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  deeper_story?: string;
  link: string;
  tools: string[];
  screenshots: string[];
  creator: {
    name: string;
    allowsContact: boolean;
  };
  reactions: {
    heart: number;
    rocket: number;
    lightbulb: number;
  };
  user_reactions?: {
    heart: boolean;
    rocket: boolean;
    lightbulb: boolean;
  };
}

export default function Gallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch approved projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return;
      }

      // Fetch reaction counts for each project
      const projectIds = projectsData?.map(p => p.id) || [];
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('project_reactions')
        .select('project_id, reaction_type, user_id')
        .in('project_id', projectIds);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      }

      // Process reactions data
      const reactionCounts: Record<string, Record<string, number>> = {};
      const userReactionsMap: Record<string, string> = {};

      reactionsData?.forEach(reaction => {
        if (!reactionCounts[reaction.project_id]) {
          reactionCounts[reaction.project_id] = { heart: 0, rocket: 0, lightbulb: 0 };
        }
        reactionCounts[reaction.project_id][reaction.reaction_type]++;

        // Track user's reactions
        if (user && reaction.user_id === user.id) {
          userReactionsMap[reaction.project_id] = reaction.reaction_type;
        }
      });

      // Transform data to match component interface
      const transformedProjects: Project[] = projectsData?.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        story: project.story,
        deeper_story: project.deeper_story,
        link: project.link,
        tools: project.tools,
        screenshots: project.screenshots || [],
        creator: {
          name: project.creator_name,
          allowsContact: project.allows_contact
        },
        reactions: {
          heart: reactionCounts[project.id]?.heart || 0,
          rocket: reactionCounts[project.id]?.rocket || 0,
          lightbulb: reactionCounts[project.id]?.lightbulb || 0
        }
      })) || [];

      setProjects(transformedProjects);
      setUserReactions(userReactionsMap);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = async (projectId: string, reactionType: string) => {
    if (!user) {
      // Redirect to auth or show login prompt
      return;
    }

    try {
      const currentReaction = userReactions[projectId];
      
      // If user already has this reaction, remove it
      if (currentReaction === reactionType) {
        const { error } = await supabase
          .from('project_reactions')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (!error) {
          const newUserReactions = { ...userReactions };
          delete newUserReactions[projectId];
          setUserReactions(newUserReactions);
        }
      } else {
        // Remove existing reaction if any, then add new one
        if (currentReaction) {
          await supabase
            .from('project_reactions')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', user.id);
        }

        const { error } = await supabase
          .from('project_reactions')
          .insert({
            project_id: projectId,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (!error) {
          setUserReactions(prev => ({ ...prev, [projectId]: reactionType }));
        }
      }

      // Refresh project data to update counts
      fetchProjects();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elegant-accent mx-auto mb-4"></div>
          <p className="text-text-elegant">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Header */}
        <GalleryHeader />

        {/* Gallery Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                userReactions={userReactions}
                onReaction={handleReaction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-elegant text-lg mb-6">No projects have been approved yet.</p>
            <p className="text-text-elegant mb-8">Be the first to share your AI creation!</p>
          </div>
        )}

        {/* Load More - for future implementation */}
        {projects.length > 0 && (
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              className="border-border hover:border-primary/50 hover:bg-primary/5 font-light px-8 py-3 backdrop-blur-sm"
              disabled
            >
              More projects coming soon...
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
