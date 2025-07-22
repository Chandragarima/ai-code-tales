
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Eye, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectCarousel } from "./ProjectCarousel";

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
}

interface ProjectCardProps {
  project: Project;
  userReactions: Record<string, string>;
  onReaction: (projectId: string, reactionType: string) => void;
}

export const ProjectCard = ({ project, userReactions, onReaction }: ProjectCardProps) => {
  const navigate = useNavigate();
  
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart': return Heart;
      case 'rocket': return Rocket; 
      case 'lightbulb': return Lightbulb;
      default: return Heart;
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1 max-w-4xl mx-auto">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="relative p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Pane - Screenshot Display */}
          <div className="w-full lg:w-2/5 bg-gradient-to-b from-[#f6d365]/5 via-[#fda085]/3 to-muted/10 p-4 flex items-center justify-center relative">
            {project.screenshots && project.screenshots.length > 0 ? (
              <div className="relative group/screenshot w-full h-48 lg:h-52">
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
                  
                  {/* Floating action button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7 bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white shadow-lg opacity-0 group-hover/screenshot:opacity-100 transition-all duration-300"
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
              <div className="flex flex-col items-center justify-center text-center w-full h-48 lg:h-52">
                <div className="w-full h-full bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">No screenshots</p>
              </div>
            )}
          </div>

          {/* Right Pane - Project Information */}
          <div className="w-full lg:w-3/5 p-5 flex flex-col relative">
            {/* External Link Button - Top Right */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-7 w-7 hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 hover:text-[#fda085] transition-all duration-300"
              onClick={() => window.open(project.link, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>

            {/* Header Section - Creator and Title */}
            <div className="mb-3 sm:mb-4 pr-10 sm:pr-12">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div 
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] flex-shrink-0"
                >
                  {project.creator.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1 font-normal">Built by {project.creator.name}</p>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-[1.2] sm:leading-[1.3] group-hover:text-[#f6d365] transition-colors duration-300">
                    {project.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Story Section - Prominent but compact */}
            <div className="mb-3 sm:mb-4 flex-1">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f6d365] to-[#fda085] rounded-full"></div>
                <div className="pl-3 sm:pl-4">
                  {/* <h4 className="text-sm font-semibold text-[#fda085] mb-1 sm:mb-2 uppercase tracking-wide">The Story</h4> */}
                  <blockquote className="text-base font-medium text-foreground/90 leading-[1.5] italic line-clamp-4 mb-2 sm:mb-3">
                    "{project.story}"
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Tools Section - Compact */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {project.tools.slice(0, 2).map((tool, index) => (
                  <Badge 
                    key={tool} 
                    variant="secondary"
                    className={`text-xs px-2.5 py-1 border transition-all duration-300 ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-[#f6d365]/10 to-[#fda085]/10 hover:from-[#f6d365]/20 hover:to-[#fda085]/20 text-foreground/90 border-[#f6d365]/20 hover:border-[#f6d365]/40' 
                        : 'bg-gradient-to-r from-[#fda085]/10 to-[#f6d365]/10 hover:from-[#fda085]/20 hover:to-[#f6d365]/20 text-foreground/90 border-[#fda085]/20 hover:border-[#fda085]/40'
                    }`}
                  >
                    {tool}
                  </Badge>
                ))}
                {project.tools.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2.5 py-1 text-muted-foreground border-white/20">
                    +{project.tools.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Bottom Section - Reactions and Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-white/10 mt-auto">
              <div className="flex items-center gap-1 sm:gap-2">
                {Object.entries(project.reactions).map(([type, count]) => {
                  const Icon = getReactionIcon(type);
                  const isActive = userReactions[project.id] === type;
                  
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 sm:gap-1.5 text-sm transition-all duration-300 h-8 sm:h-7 px-2 sm:px-2 text-muted-foreground hover:text-foreground ${
                        isActive 
                          ? 'text-[#fda085] bg-gradient-to-r from-[#f6d365]/10 to-[#fda085]/10' 
                          : 'hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5'
                      }`}
                      onClick={() => onReaction(project.id, type)}
                    >
                      <Icon className={`h-4 w-4 sm:h-3.5 sm:w-3.5 ${isActive ? 'fill-current' : ''}`} />
                      <span className="font-medium">{count + (isActive ? 1 : 0)}</span>
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="text-sm h-8 sm:h-7 px-3 sm:px-2.5 bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 hover:from-[#f6d365]/30 hover:to-[#fda085]/30 text-foreground hover:text-[#fda085] transition-all duration-300 border-[#f6d365]/30 hover:border-[#f6d365]/50"
                >
                  <Eye className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1" />
                  Details
                </Button>
                
                {project.creator.allowsContact && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-sm h-8 sm:h-7 px-3 sm:px-2.5 hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 hover:text-[#fda085] transition-all duration-300 border-white/20 hover:border-[#f6d365]/40"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
