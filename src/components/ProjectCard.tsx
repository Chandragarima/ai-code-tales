
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Eye, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectCarousel } from "./ProjectCarousel";
import { useState, useEffect } from "react";
import { MessageDialog } from "./MessageDialog";
import { supabase } from "@/integrations/supabase/client";

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
    <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1 max-w-5xl mx-auto">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="relative p-0">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Pane - Screenshot Display */}
          <div className="w-full md:w-2/5 bg-gradient-to-b from-[#f6d365]/5 via-[#fda085]/3 to-muted/10 p-3 sm:p-4 flex items-center justify-center relative">
            {project.screenshots && project.screenshots.length > 0 ? (
              <div className="relative group/screenshot w-full h-40 sm:h-48 md:h-52">
                {/* Screenshot Display */}
                <div className="relative w-full h-full overflow-hidden rounded-lg border border-white/20 shadow-md">
                  <img 
                    src={project.screenshots[0]} 
                    alt={`${project.name} preview`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/screenshot:scale-105"
                  />
                  
                  {/* Overlay for multiple screenshots */}
                  {project.screenshots.length > 1 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-800 shadow-lg">
                        +{project.screenshots.length - 1} more
                      </div>
                    </div>
                  )}
                  
                  {/* Floating action button - Hidden on mobile */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hidden md:flex absolute top-2 right-2 h-7 w-7 bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white shadow-lg opacity-0 group-hover/screenshot:opacity-100 transition-all duration-300"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Subtle decorative elements */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-[#f6d365]/20 to-[#fda085]/20 rounded-full opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-[#fda085]/20 to-[#f6d365]/20 rounded-full opacity-0 group-hover/screenshot:opacity-100 transition-opacity duration-300 delay-100"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center w-full h-40 sm:h-48 md:h-52">
                <div className="w-full h-full bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">No screenshots</p>
              </div>
            )}
          </div>

          {/* Right Pane - Project Information - Mobile: clickable, Desktop: not clickable */}
          <div 
            className="w-full md:w-3/5 p-3 sm:p-4 md:p-5 flex flex-col relative md:cursor-default cursor-pointer" 
            onClick={(e) => {
              // Only handle click on mobile (not desktop)
              if (window.innerWidth < 768) {
                // Prevent click if clicking on buttons or interactive elements
                const target = e.target as HTMLElement;
                if (target.closest('button') || target.closest('a')) {
                  return;
                }
                navigate(`/project/${project.id}`);
              }
            }}
          >
            {/* External Link Button - Top Right */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3 md:top-4 md:right-4 h-6 w-6 md:h-7 md:w-7 hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 hover:text-[#fda085] transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                window.open(project.link, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Button>

            {/* Header Section - Creator and Title */}
            <div className="mb-2 sm:mb-3 md:mb-4 pr-6 sm:pr-8 md:pr-10">
              <div className="flex items-start gap-2 mb-1.5 sm:mb-2 md:mb-3">
                {updatedProject.creator.avatar_url ? (
                  <img
                    src={updatedProject.creator.avatar_url}
                    alt={updatedProject.creator.name}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-full object-cover shadow-sm border-2 border-[#f6d365]/20 flex-shrink-0"
                  />
                ) : (
                  <div 
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] flex-shrink-0"
                  >
                    {updatedProject.creator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5 font-normal">Built by {updatedProject.creator.name}</p>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground leading-[1.2] group-hover:text-[#f6d365] transition-colors duration-300">
                    {project.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Story Section - More compact on mobile */}
            <div className="mb-2 sm:mb-3 md:mb-4 flex-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f6d365] to-[#fda085] rounded-full"></div>
                <div className="pl-2.5 sm:pl-3 md:pl-4">
                  <blockquote className="text-xs sm:text-sm md:text-base font-medium text-foreground/90 leading-[1.4] italic line-clamp-2 sm:line-clamp-3 md:line-clamp-4">
                    "{project.story}"
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Tools Section - More compact on mobile */}
            <div className="mb-3 md:mb-4">
              <div className="flex flex-wrap gap-1">
                {project.tools.slice(0, 2).map((tool, index) => (
                  <Badge 
                    key={tool} 
                    variant="secondary"
                    className={`text-xs px-2 py-0.5 md:px-2.5 md:py-1 border transition-all duration-300 ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-[#f6d365]/10 to-[#fda085]/10 hover:from-[#f6d365]/20 hover:to-[#fda085]/20 text-foreground/90 border-[#f6d365]/20 hover:border-[#f6d365]/40' 
                        : 'bg-gradient-to-r from-[#fda085]/10 to-[#f6d365]/10 hover:from-[#fda085]/20 hover:to-[#f6d365]/20 text-foreground/90 border-[#fda085]/20 hover:border-[#fda085]/40'
                    }`}
                  >
                    {tool}
                  </Badge>
                ))}
                {project.tools.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 md:px-2.5 md:py-1 text-muted-foreground border-white/20">
                    +{project.tools.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom Section - Reactions and Actions */}
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0 pt-2 border-t border-white/10 mt-auto">
              <div className="flex items-center gap-1">
                {Object.entries(project.reactions).map(([type, count]) => {
                  const Icon = getReactionIcon(type);
                  const isActive = userReactions[project.id] === type;
                  
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 text-xs transition-all duration-300 h-6 sm:h-7 md:h-8 px-1 sm:px-1.5 md:px-2 text-muted-foreground hover:text-foreground ${
                        isActive 
                          ? 'text-[#fda085] bg-gradient-to-r from-[#f6d365]/10 to-[#fda085]/10' 
                          : 'hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReaction(project.id, type);
                      }}
                    >
                      <Icon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 ${isActive ? 'fill-current' : ''}`} />
                      <span className="font-medium text-xs">{count}</span>
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-1">
                {/* Desktop View Button */}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project.id}`);
                  }}
                  className="hidden md:flex text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 hover:from-[#f6d365]/30 hover:to-[#fda085]/30 text-foreground hover:text-[#fda085] transition-all duration-300 border-[#f6d365]/30 hover:border-[#f6d365]/50"
                >
                  <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                  <span className="hidden xs:inline">Details</span>
                  <span className="xs:hidden">View</span>
                </Button>
              
                {project.creator.allowsContact && project.user_id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 md:px-3 hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 hover:text-[#fda085] transition-all duration-300 border-white/20 hover:border-[#f6d365]/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMessageDialog(true);
                    }}
                  >
                    <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    <span className="hidden xs:inline">Connect</span>
                    <span className="xs:hidden">Chat</span>
                  </Button>
                )}
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
