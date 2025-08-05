
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
      let totalViews = 0;
      
      if (projectIds.length > 0) {
        // Get reactions
        const { data: reactions, error: reactionsError } = await supabase
          .from('project_reactions')
          .select('reaction_type')
          .in('project_id', projectIds);

        if (!reactionsError && reactions) {
          totalReactions = reactions.length;
        }

        // Get real views from project_views table
        const { data: views, error: viewsError } = await supabase
          .from('project_views')
          .select('id')
          .in('project_id', projectIds);

        if (!viewsError && views) {
          totalViews = views.length;
        }
      }

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
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          {/* Mobile Header Bar */}
          <div className="md:hidden mb-3">
            {/* <div className="flex items-center gap-3 mb-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-[#fda085] transition-colors duration-200 p-2 -ml-2"
                size="sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button> */}
              
              <h1 className="font-['Playfair_Display'] text-2xl text-center font-normal bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                My Projects
              </h1>
              <div className="flex flex-col items-center mt-4 mb-8">
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
            {/* </div> */}
          </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block text-center">
            <div className="flex flex-col items-center space-y-6 lg:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                My Projects
              </h1>
              {/* Divider */}
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              {/* Subtitle */}
              <p className="text-sm lg:text-base text-foreground/70 max-w-[700px] font-extralight leading-[1.8] tracking-[0.3px]">
                Manage your projects and see how your stories are resonating with the community.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Compact Layout */}
        <div className="md:hidden">
          {/* Compact Stats Row */}
          <div className="flex gap-2">
            <div className="flex-1 bg-card/60 backdrop-blur-sm border border-border/30 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-md flex items-center justify-center mx-auto mb-1">
                <FolderOpen className="h-3 w-3 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground">{stats.totalProjects}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            
            <div className="flex-1 bg-card/60 backdrop-blur-sm border border-border/30 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-md flex items-center justify-center mx-auto mb-1">
                <Eye className="h-3 w-3 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground">{stats.totalViews}</p>
              <p className="text-xs text-muted-foreground">Views</p>
            </div>
            
            <div className="flex-1 bg-card/60 backdrop-blur-sm border border-border/30 rounded-lg p-3 text-center">
              <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-md flex items-center justify-center mx-auto mb-1">
                <Heart className="h-3 w-3 text-white" />
              </div>
              <p className="text-lg font-semibold text-foreground">{stats.totalReactions}</p>
              <p className="text-xs text-muted-foreground">Reactions</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block space-y-8">
          {/* Stats Section */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
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

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/submit')}
              className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-black font-semibold shadow-lg hover:shadow-xl hover:shadow-[#fda085]/20 transition-all duration-300 group px-8 py-3 rounded-xl relative overflow-hidden"
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Submit New Project
            </Button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mt-6 md:mt-8">
          <MyProjects />
        </div>

        {/* Mobile Floating Action Button */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => navigate('/submit')}
            className="w-14 h-14 bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-black shadow-xl hover:shadow-2xl hover:shadow-[#fda085]/30 transition-all duration-300 group rounded-full relative overflow-hidden"
          >
            {/* Subtle shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}
