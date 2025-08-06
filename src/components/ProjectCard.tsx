
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Eye, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectCarousel } from "./ProjectCarousel";
import { useState, useEffect } from "react";
import { MessageDialog } from "./MessageDialog";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  deeper_story?: string;
  link: string;
  tools: string[];
  screenshots: string[];
  user_id?: string;
  creator: {
    name: string;
    allowsContact: boolean;
    avatar_url?: string;
  };
  reactions: {
    heart: number;
    rocket: number;
    lightbulb: number;
  };
}

interface ProjectCardProps {
  project: Project;
  userReactions: Record<string, string>;
  onReaction: (projectId: string, reactionType: string) => void;
}

interface ProjectForMessaging {
  id: string;
  user_id: string;
  creator_name: string;
  allows_contact: boolean;
}

export const ProjectCard = ({ project, userReactions, onReaction }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [updatedProject, setUpdatedProject] = useState(project);
  
  // Listen for profile updates to refresh creator data
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!project.user_id) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', project.user_id)
          .single();

        if (data) {
          setUpdatedProject(prev => ({
            ...prev,
            creator: {
              ...prev.creator,
              name: data.username || prev.creator.name,
              avatar_url: data.avatar_url
            }
          }));
        }
      } catch (error) {
        // Profile might not exist yet, use original data
        console.log('Creator profile not found, using original data');
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [project.user_id]);

  // Update local state when project prop changes
  useEffect(() => {
    setUpdatedProject(project);
  }, [project]);
  
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart': return Heart;
      case 'rocket': return Rocket; 
      case 'lightbulb': return Lightbulb;
      default: return Heart;
    }
  };

  return (
    <Card 
      className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-[#fda085]/10 bg-card/95 backdrop-blur-sm hover:-translate-y-2 w-full max-w-4xl mx-auto cursor-pointer rounded-xl"
      onClick={(e) => {
        // Prevent click if clicking on buttons or interactive elements
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) {
          return;
        }
        navigate(`/project/${project.id}`);
      }}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <CardContent className="relative p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Pane - Screenshot Display - More compact */}
          <div className="w-full lg:w-2/5 bg-gradient-to-br from-[#f6d365]/8 via-[#fda085]/5 to-transparent p-4 flex items-center justify-center relative border-r border-border/30">
            {project.screenshots && project.screenshots.length > 0 ? (
              <div className="relative group/screenshot w-full h-48 lg:h-56">
                {project.screenshots.length > 1 ? (
                  <div className="relative w-full h-full">
                    <ProjectCarousel screenshots={project.screenshots} projectName={project.name} />
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden rounded-xl border border-white/10 shadow-lg bg-gradient-to-br from-white/5 to-transparent">
                    <img 
                      src={project.screenshots[0]} 
                      alt={`${project.name} preview`}
                      className="w-full h-full object-cover transition-all duration-500 group-hover/screenshot:scale-110"
                    />
                    {/* Elegant overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                
                {/* Modern accent dots */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#f6d365]/60 rounded-full opacity-0 group-hover/screenshot:opacity-100 transition-all duration-300 delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-[#fda085]/60 rounded-full opacity-0 group-hover/screenshot:opacity-100 transition-all duration-300 delay-200"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center w-full h-48 lg:h-56">
                <div className="w-full h-full bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl border-2 border-dashed border-muted-foreground/15 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-xs text-muted-foreground mt-3">No screenshots</p>
              </div>
            )}
          </div>

          {/* Right Pane - Project Information - Optimized layout */}
          <div className="w-full lg:w-3/5 p-6 flex flex-col relative min-w-0">
            {/* External Link Button - Redesigned */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gradient-to-r hover:from-[#f6d365]/15 hover:to-[#fda085]/15 hover:text-[#fda085] transition-all duration-300 border border-transparent hover:border-[#f6d365]/20"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.link, '_blank');
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            {/* Header Section - Streamlined */}
            <div className="mb-4 pr-12">
              <div className="flex items-center gap-3 mb-3">
                {updatedProject.creator.avatar_url ? (
                  <img
                    src={updatedProject.creator.avatar_url}
                    alt={updatedProject.creator.name}
                    className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-[#f6d365]/30 flex-shrink-0"
                  />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] flex-shrink-0"
                  >
                    {updatedProject.creator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground/80 mb-1 font-medium">Built by {updatedProject.creator.name}</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground leading-tight group-hover:text-[#f6d365] transition-colors duration-300 truncate">
                    {project.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Story Section - Enhanced with better typography */}
            <div className="mb-5 flex-1">
              <div className="relative pl-4">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f6d365] via-[#fda085] to-[#f6d365] rounded-full"></div>
                <blockquote className="text-sm lg:text-base font-medium text-foreground/85 leading-relaxed line-clamp-3 lg:line-clamp-4">
                  "{project.story}"
                </blockquote>
              </div>
            </div>

            {/* Tools and Actions Section - Unified bottom area */}
            <div className="flex flex-col gap-4">
              {/* Tools Section */}
              <div className="flex flex-wrap gap-2">
                {project.tools.slice(0, 3).map((tool, index) => (
                  <Badge 
                    key={tool} 
                    variant="secondary"
                    className={`text-xs px-3 py-1.5 border transition-all duration-300 rounded-lg font-medium ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-[#f6d365]/12 to-[#fda085]/12 hover:from-[#f6d365]/25 hover:to-[#fda085]/25 text-foreground border-[#f6d365]/25 hover:border-[#f6d365]/50' 
                        : 'bg-gradient-to-r from-[#fda085]/12 to-[#f6d365]/12 hover:from-[#fda085]/25 hover:to-[#f6d365]/25 text-foreground border-[#fda085]/25 hover:border-[#fda085]/50'
                    }`}
                  >
                    {tool}
                  </Badge>
                ))}
                {project.tools.length > 3 && (
                  <Badge variant="outline" className="text-xs px-3 py-1.5 text-muted-foreground border-white/25 rounded-lg">
                    +{project.tools.length - 3}
                  </Badge>
                )}
              </div>

              {/* Bottom Actions - Clean layout */}
              <div className="flex items-center justify-between pt-2 border-t border-border/20">
                <div className="flex items-center gap-1">
                  {Object.entries(project.reactions).map(([type, count]) => {
                    const Icon = getReactionIcon(type);
                    const isActive = userReactions[project.id] === type;
                    
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1.5 text-sm transition-all duration-300 h-9 px-3 rounded-lg ${
                          isActive 
                            ? 'text-[#fda085] bg-gradient-to-r from-[#f6d365]/15 to-[#fda085]/15 shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-[#f6d365]/8 hover:to-[#fda085]/8'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onReaction(project.id, type);
                        }}
                      >
                        <Icon className={`h-4 w-4 transition-all duration-300 ${isActive ? 'fill-current scale-110' : ''}`} />
                        <span className="font-semibold">{count}</span>
                      </Button>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-2">
                  {project.creator.allowsContact && project.user_id && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm h-9 px-4 hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 hover:text-[#fda085] transition-all duration-300 border-white/25 hover:border-[#f6d365]/50 rounded-lg font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMessageDialog(true);
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Message Dialog */}
      {showMessageDialog && project.user_id && (
        <MessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          projectId={project.id}
          creatorId={project.user_id}
          creatorName={project.creator.name}
          projectName={project.name}
        />
      )}
    </Card>
  );
};
