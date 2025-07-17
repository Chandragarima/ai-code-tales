
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle } from "lucide-react";
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
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart': return Heart;
      case 'rocket': return Rocket; 
      case 'lightbulb': return Lightbulb;
      default: return Heart;
    }
  };

  return (
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-card/80 backdrop-blur-sm hover:-translate-y-2">
      {/* Gradient overlay for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="relative p-0">
        <div className="flex">
          {/* Left Side - Image Section (1/3 of space) */}
          <div className="w-1/3 relative">
            {project.screenshots && project.screenshots.length > 0 ? (
              <div className="relative h-full min-h-[200px]">
                <img 
                  src={project.screenshots[0]} 
                  alt={`${project.name} screenshot`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error('Image failed to load:', target.src);
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback when image fails to load */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-accent/10 flex items-center justify-center hidden">
                  <div className="text-foreground/40 text-sm">Image unavailable</div>
                </div>
                {/* Overlay with project info on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white transition-all duration-300"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Project
                  </Button>
                </div>
                {/* Image counter badge */}
                {project.screenshots.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    +{project.screenshots.length - 1}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-muted/20 to-accent/10 flex items-center justify-center">
                <div className="text-foreground/40 text-sm">No Screenshot</div>
              </div>
            )}
          </div>

          {/* Right Side - Content Section (2/3 of space) */}
          <div className="w-2/3 p-6 flex flex-col">
            {/* Header Section */}
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                {project.name}
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Story Section - Focus Point */}
            <div className="flex-1 mb-4">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f6d365] to-[#fda085] rounded-full"></div>
                <p className="text-sm italic text-foreground/90 leading-relaxed pl-4 line-clamp-4">
                  "{project.story}"
                </p>
              </div>
            </div>

            {/* Tools Section */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {project.tools.slice(0, 4).map((tool, toolIndex) => (
                  <Badge 
                    key={tool} 
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-secondary/80 to-muted/80 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 px-2 py-0.5 border border-border/30 hover:border-primary/30"
                    style={{
                      background: toolIndex % 2 === 0 
                        ? 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))'
                        : 'linear-gradient(135deg, hsl(var(--accent) / 0.1), hsl(var(--secondary) / 0.2))'
                    }}
                  >
                    {tool}
                  </Badge>
                ))}
                {project.tools.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{project.tools.length - 4}
                  </Badge>
                )}
              </div>
            </div>

            {/* Footer Section - Creator and Reactions */}
            <div className="flex items-center justify-between mt-auto">
              {/* Creator Info */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
                  }}
                >
                  {project.creator.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-xs text-foreground/80 font-medium truncate">{project.creator.name}</span>
                {project.creator.allowsContact && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 h-6 px-2 border border-transparent hover:border-primary/20"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-1">
                {Object.entries(project.reactions).map(([type, count]) => {
                  const Icon = getReactionIcon(type);
                  const isActive = userReactions[project.id] === type;
                  
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 text-xs transition-all duration-300 h-6 px-2 border border-transparent hover:border-primary/20 ${
                        isActive 
                          ? 'text-primary bg-primary/10 border-primary/30 shadow-sm' 
                          : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                      }`}
                      onClick={() => onReaction(project.id, type)}
                    >
                      <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''}`} />
                      <span className="font-medium text-xs">{count + (isActive ? 1 : 0)}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
