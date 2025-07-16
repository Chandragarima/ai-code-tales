
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Eye } from "lucide-react";
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
    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-card/80 backdrop-blur-sm hover:-translate-y-2">
      {/* Gradient overlay for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <CardContent className="relative p-0">
        {/* Builder Spotlight Section */}
        <div className="p-6 pb-4 bg-gradient-to-r from-card via-card to-muted/20">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
              }}
            >
              {project.creator.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-semibold text-foreground">Built by {project.creator.name}</span>
                {project.creator.allowsContact && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-6 px-2 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                {project.name}
              </h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
              onClick={() => window.open(project.link, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Story as Primary - Redesigned */}
        <div className="px-6 py-6 bg-gradient-to-r from-muted/10 to-accent/5">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-accent/40 rounded-full"></div>
            <div className="pl-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 leading-tight">The Story</h3>
              <blockquote className="text-base font-medium text-foreground/90 leading-relaxed mb-4 italic">
                "{project.story}"
              </blockquote>
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                {project.description}
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/project/${project.id}`)}
                className="text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 p-0 h-auto font-medium"
              >
                <Eye className="h-4 w-4 mr-2" />
                Read full story
              </Button>
            </div>
          </div>
        </div>

        {/* Screenshots as Secondary - Compact */}
        {project.screenshots && project.screenshots.length > 0 && (
          <div className="px-6 pb-4">
            <div className="relative h-24 rounded-lg overflow-hidden border border-border/30 cursor-pointer" 
                 onClick={() => navigate(`/project/${project.id}`)}>
              <img 
                src={project.screenshots[0]} 
                alt={`${project.name} preview`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {project.screenshots.length > 1 && (
                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  +{project.screenshots.length - 1}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        )}

        {/* Decorative Separator */}
        <div className="px-6">
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-border/20 via-primary/20 to-border/20"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full border-2 border-card"></div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {project.tools.map((tool, toolIndex) => (
              <Badge 
                key={tool} 
                variant="secondary"
                className="text-xs bg-gradient-to-r from-secondary/80 to-muted/80 hover:from-primary/20 hover:to-accent/20 transition-all duration-300 px-3 py-1 border border-border/30 hover:border-primary/30"
                style={{
                  background: toolIndex % 2 === 0 
                    ? 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))'
                    : 'linear-gradient(135deg, hsl(var(--accent) / 0.1), hsl(var(--secondary) / 0.2))'
                }}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* Premium Separator */}
        <div className="px-6">
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/40 via-accent/40 to-transparent"></div>
            <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-1 h-1 bg-primary/50 rounded-full"></div>
            <div className="absolute right-1/3 top-1/2 -translate-y-1/2 w-1 h-1 bg-accent/50 rounded-full"></div>
          </div>
        </div>


        {/* Final Artistic Separator */}
        <div className="px-6">
          <div className="h-px bg-gradient-to-r from-primary/20 via-accent/30 via-primary/20 to-transparent"></div>
        </div>

        {/* Reactions Section */}
        <div className="px-6 py-4 bg-gradient-to-r from-muted/5 to-accent/5">
          <div className="flex items-center gap-4">
            {Object.entries(project.reactions).map(([type, count]) => {
              const Icon = getReactionIcon(type);
              const isActive = userReactions[project.id] === type;
              
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1.5 text-xs transition-all duration-300 h-8 px-3 border border-transparent hover:border-primary/20 ${
                    isActive 
                      ? 'text-primary bg-primary/10 border-primary/30 shadow-sm' 
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => onReaction(project.id, type)}
                >
                  <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''}`} />
                  <span className="font-medium">{count + (isActive ? 1 : 0)}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
