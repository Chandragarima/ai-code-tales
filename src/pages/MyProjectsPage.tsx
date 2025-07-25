
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FolderOpen, Plus, Sparkles, Eye, Heart, TrendingUp, Users, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MyProjects } from "@/components/MyProjects";
import { supabase } from "@/integrations/supabase/client";

interface ProjectStats {
  totalProjects: number;
  totalViews: number;
  totalReactions: number;
}

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    totalViews: 0,
    totalReactions: 0
  });

  useEffect(() => {
    console.log('loading', loading)
    console.log('user', user) 

    if (loading && !user) {
      console.log('loading auth')
      navigate('/auth');
    }
    
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      console.log('fetching user stats')
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get user's projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id);

      if (projectsError) {
        console.error('Error fetching projects for stats:', projectsError);
        return;
      }

      // Get reactions for user's projects
      const projectIds = projects?.map(p => p.id) || [];
      let totalReactions = 0;
      
      if (projectIds.length > 0) {
        const { data: reactions, error: reactionsError } = await supabase
          .from('project_reactions')
          .select('reaction_type')
          .in('project_id', projectIds);

        if (!reactionsError && reactions) {
          totalReactions = reactions.length;
        }
      }

      // For now, we'll use a simple calculation for views (could be enhanced with actual view tracking)
      const totalViews = projects?.length * 10 || 0; // Placeholder calculation

      setStats({
        totalProjects: projects?.length || 0,
        totalViews,
        totalReactions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#f6d365]/5 to-[#fda085]/5 rounded-full blur-3xl pointer-events-none"></div>
       */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-10 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="md:hidden mb-6 sm:mb-8 text-muted-foreground hover:text-[#fda085] hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5 transition-all duration-300 font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
          
          <div className="text-center">
            <div className="flex flex-col items-center space-y-6 sm:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.75rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                My Projects
              </h1>
              {/* Divider */}
              <div className="w-8 sm:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              <p className="text-sm sm:text-base lg:text-lg text-foreground/70 max-w-[700px] font-extralight leading-[1.8] tracking-[0.3px] px-4">
                Manage your projects and see how your stories are resonating with the community.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <Button 
            onClick={() => navigate('/submit')}
            className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Submit New Project
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:bg-card/80 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center mx-auto mb-2">
                <FolderOpen className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:bg-card/80 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Eye className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.totalViews}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-xl p-4 text-center hover:bg-card/80 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center mx-auto mb-2">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-semibold text-foreground">{stats.totalReactions}</p>
              <p className="text-sm text-muted-foreground">Total Reactions</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <MyProjects />
      </div>
    </div>
  );
}
