import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Rocket, Lightbulb, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  link: string;
  tools: string[];
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

// Mock data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "AI Recipe Generator",
    description: "Transform random ingredients into gourmet meals",
    story: "I was tired of staring into my fridge wondering what to cook. Built this to turn whatever ingredients I have into actual meal ideas.",
    link: "https://ai-recipe-gen.com",
    tools: ["Claude", "React", "Tailwind"],
    creator: { name: "Sarah Chen", allowsContact: true },
    reactions: { heart: 42, rocket: 28, lightbulb: 15 }
  },
  {
    id: "2", 
    name: "Mood-Based Playlist Creator",
    description: "Curate music based on your current emotional state",
    story: "Music is deeply personal. I wanted something that understood not just my taste, but how I'm feeling in the moment.",
    link: "https://mood-music.app",
    tools: ["GPT-4", "Spotify API", "Next.js"],
    creator: { name: "Alex Rivera", allowsContact: false },
    reactions: { heart: 38, rocket: 52, lightbulb: 29 }
  },
  {
    id: "3",
    name: "Code Comment Translator", 
    description: "Automatically translate code comments across languages",
    story: "Working with international teams, I found myself constantly translating comments. This tool keeps the code flowing regardless of language barriers.",
    link: "https://code-translate.dev",
    tools: ["Anthropic API", "VS Code Extension", "TypeScript"],
    creator: { name: "Maya Patel", allowsContact: true },
    reactions: { heart: 67, rocket: 31, lightbulb: 43 }
  }
];

export default function Gallery() {
  const navigate = useNavigate();
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});

  const handleReaction = (projectId: string, reactionType: string) => {
    setUserReactions(prev => ({ ...prev, [projectId]: reactionType }));
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart': return Heart;
      case 'rocket': return Rocket; 
      case 'lightbulb': return Lightbulb;
      default: return Heart;
    }
  };

  return (
    <div className="min-h-screen bg-background bg-tech-grid bg-grid">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-artistic-gradient bg-clip-text text-transparent">
            Bespoke Gallery
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Where every AI-built project has a story worth telling
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/submit')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg animate-tech-glow"
            >
              Share Your Story
            </Button>
            <Button variant="outline" className="border-gallery-border px-8 py-3 text-lg">
              Discover More
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProjects.map((project) => (
            <Card 
              key={project.id}
              className="group relative overflow-hidden border-gallery-border hover:border-tech-glow/50 transition-all duration-300 hover:shadow-lg hover:shadow-tech-glow/20 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-tech-glow transition-colors">
                    {project.name}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>

                {/* Story Preview */}
                <div className="mb-4 p-3 bg-muted/30 rounded-lg border-l-2 border-accent">
                  <p className="text-sm italic text-muted-foreground">
                    "{project.story}"
                  </p>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tools.map((tool) => (
                    <Badge 
                      key={tool} 
                      variant="secondary"
                      className="text-xs bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>

                {/* Creator & Contact */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-artistic-gradient rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {project.creator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm text-muted-foreground">{project.creator.name}</span>
                  </div>
                  {project.creator.allowsContact && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gallery-border">
                  {Object.entries(project.reactions).map(([type, count]) => {
                    const Icon = getReactionIcon(type);
                    const isActive = userReactions[project.id] === type;
                    
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 text-xs ${
                          isActive ? 'text-tech-glow' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => handleReaction(project.id, type)}
                      >
                        <Icon className={`h-3 w-3 ${isActive ? 'fill-current' : ''}`} />
                        {count + (isActive ? 1 : 0)}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-gallery-border hover:border-tech-glow/50">
            Load More Stories
          </Button>
        </div>
      </div>
    </div>
  );
}