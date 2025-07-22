
import { useState, useEffect } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { GalleryHeader } from '@/components/GalleryHeader';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  deeper_story: string;
  link: string;
  tools: string[];
  screenshots: string[];
  user_id?: string;
  creator: {
    name: string;
    allowsContact: boolean;
  };
  reactions: {
    heart: number;
    rocket: number;
    lightbulb: number;
  };
}

export default function Gallery() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState('All');
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
    if (user) {
      fetchUserReactions();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      // Fetch real projects from database
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        // Use only mock projects if database fetch fails
        // setProjects(mockProjects); // Removed mock projects
        return;
      }

      // Fetch reactions for real projects
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('project_reactions')
        .select('project_id, reaction_type');

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      }

      // Count reactions by project and type
      const reactionCounts: Record<string, Record<string, number>> = {};
      
      reactionsData?.forEach(reaction => {
        if (!reactionCounts[reaction.project_id]) {
          reactionCounts[reaction.project_id] = { heart: 0, rocket: 0, lightbulb: 0 };
        }
        reactionCounts[reaction.project_id][reaction.reaction_type] = 
          (reactionCounts[reaction.project_id][reaction.reaction_type] || 0) + 1;
      });

      // Transform database projects to match UI interface
      const transformedProjects: Project[] = projectsData?.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        story: project.story,
        deeper_story: project.deeper_story || '',
        link: project.link,
        tools: project.tools,
        screenshots: project.screenshots || [],
        user_id: project.user_id, // Include user_id for messaging
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

      // Combine mock projects with real projects // Removed mock projects
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Unexpected error:', error);
      // Fallback to mock projects // Removed mock projects
      setProjects([]);
    }
    
    // Always ensure loading is set to false
    setLoading(false);
  };

  const fetchUserReactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('project_reactions')
      .select('project_id, reaction_type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching user reactions:', error);
      return;
    }

    const reactions: Record<string, string> = {};
    data?.forEach(reaction => {
      reactions[reaction.project_id] = reaction.reaction_type;
    });
    setUserReactions(reactions);
  };

  const handleReaction = async (projectId: string, reactionType: string) => {
    if (!user) return;

    const currentReaction = userReactions[projectId];
    
    if (currentReaction === reactionType) {
      // Remove reaction
      const { error } = await supabase
        .from('project_reactions')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (!error) {
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[projectId];
          return newReactions;
        });
        // Refresh reaction counts
        refreshReactionCounts();
      }
    } else {
      // First, delete any existing reaction by this user for this project
      if (currentReaction) {
        const { error: deleteError } = await supabase
          .from('project_reactions')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting existing reaction:', deleteError);
          return;
        }
      }

      // Then insert the new reaction
      const { error } = await supabase
        .from('project_reactions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (!error) {
        setUserReactions(prev => ({
          ...prev,
          [projectId]: reactionType
        }));
        // Refresh reaction counts
        refreshReactionCounts();
      }
    }
  };

  const refreshReactionCounts = async () => {
    try {
      // Fetch updated reactions for all projects
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('project_reactions')
        .select('project_id, reaction_type');

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
        return;
      }

      // Count reactions by project and type
      const reactionCounts: Record<string, Record<string, number>> = {};
      
      reactionsData?.forEach(reaction => {
        if (!reactionCounts[reaction.project_id]) {
          reactionCounts[reaction.project_id] = { heart: 0, rocket: 0, lightbulb: 0 };
        }
        reactionCounts[reaction.project_id][reaction.reaction_type] = 
          (reactionCounts[reaction.project_id][reaction.reaction_type] || 0) + 1;
      });

      // Update projects with new reaction counts
      setProjects(prevProjects => 
        prevProjects.map(project => {
          return {
            ...project,
            reactions: {
              heart: reactionCounts[project.id]?.heart || 0,
              rocket: reactionCounts[project.id]?.rocket || 0,
              lightbulb: reactionCounts[project.id]?.lightbulb || 0
            }
          };
        })
      );
    } catch (error) {
      console.error('Error refreshing reaction counts:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tools.some(tool => tool.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTool = selectedTool === 'All' || project.tools.includes(selectedTool);
    
    return matchesSearch && matchesTool;
  });

  const allTools = ['All', ...Array.from(new Set(projects.flatMap(p => p.tools)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading amazing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
        <GalleryHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          availableTools={allTools}
        />

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-foreground/60 text-base sm:text-lg">No projects found matching your criteria.</p>
            <p className="text-foreground/40 mt-2 text-sm sm:text-base">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:gap-12">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                userReactions={userReactions}
                onReaction={handleReaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
