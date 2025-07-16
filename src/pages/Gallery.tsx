
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

// Mock projects to show UI examples
const mockProjects: Project[] = [
  {
    id: 'mock-1',
    name: 'AI Recipe Generator',
    description: 'Transform your leftover ingredients into delicious meals with AI-powered recipe suggestions.',
    story: 'Born from the frustration of wasting food and not knowing what to cook, this app uses machine learning to suggest creative recipes based on available ingredients.',
    deeper_story: 'The idea came to me during a particularly uninspiring evening staring into my nearly-empty fridge. Instead of ordering takeout again, I wondered: what if AI could help me create something delicious from what I already have?',
    link: 'https://ai-recipe-gen.example.com',
    tools: ['React', 'OpenAI API', 'Node.js', 'MongoDB'],
    screenshots: ['/placeholder.svg'],
    creator: {
      name: 'Sarah Chen',
      allowsContact: true
    },
    reactions: {
      heart: 24,
      rocket: 8,
      lightbulb: 12
    }
  },
  {
    id: 'mock-2',
    name: 'Focus Flow',
    description: 'A minimalist productivity app that adapts to your work patterns and helps maintain deep focus.',
    story: 'After struggling with traditional productivity methods, I built an app that learns from your work habits and suggests optimal focus sessions.',
    deeper_story: 'As someone with ADHD, I found existing productivity apps either too rigid or too chaotic. Focus Flow uses gentle AI nudges and pattern recognition to create a personalized workflow that actually works with how your brain operates.',
    link: 'https://focusflow.example.com',
    tools: ['Vue.js', 'Python', 'TensorFlow', 'PostgreSQL'],
    screenshots: ['/placeholder.svg'],
    creator: {
      name: 'Alex Rivera',
      allowsContact: false
    },
    reactions: {
      heart: 31,
      rocket: 15,
      lightbulb: 9
    }
  },
  {
    id: 'mock-3',
    name: 'Local Explorer AR',
    description: 'Discover hidden gems in your city through augmented reality storytelling.',
    story: 'Combines GPS data with AR to reveal the untold stories of places around you - from historical events to local legends.',
    deeper_story: 'Moving to a new city made me realize how much history and culture we walk past every day without knowing. This app turns every street corner into a potential discovery, using AR to overlay stories, reviews, and hidden details about local spots.',
    link: 'https://localexplorer.example.com',
    tools: ['React Native', 'ARKit', 'Firebase', 'Google Maps API'],
    screenshots: ['/placeholder.svg'],
    creator: {
      name: 'Jamie Park',
      allowsContact: true
    },
    reactions: {
      heart: 18,
      rocket: 22,
      lightbulb: 16
    }
  }
];

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
        setProjects(mockProjects);
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

      // Combine mock projects with real projects
      setProjects([...mockProjects, ...transformedProjects]);
    } catch (error) {
      console.error('Unexpected error:', error);
      // Fallback to mock projects
      setProjects(mockProjects);
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
        .eq('user_id', user.id);

      if (!error) {
        setUserReactions(prev => {
          const newReactions = { ...prev };
          delete newReactions[projectId];
          return newReactions;
        });
      }
    } else {
      // Add or update reaction
      const { error } = await supabase
        .from('project_reactions')
        .upsert({
          project_id: projectId,
          user_id: user.id,
          reaction_type: reactionType
        });

      if (!error) {
        setUserReactions(prev => ({
          ...prev,
          [projectId]: reactionType
        }));
      }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-4 py-8">
        <GalleryHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          availableTools={allTools}
        />

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-foreground/60 text-lg">No projects found matching your criteria.</p>
            <p className="text-foreground/40 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:gap-12">
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
