
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 mb-8">
            <h1 className="text-7xl font-light px-8 py-4 bg-background/80 backdrop-blur-sm rounded-xl bg-elegant-gradient bg-clip-text text-transparent">
              Gallery
            </h1>
          </div>
          <p className="text-xl text-foreground/80 mb-12 max-w-2xl mx-auto font-light">
            Curated stories behind exceptional AI-built applications
          </p>
          <div className="flex gap-6 justify-center">
            <Button 
              onClick={() => navigate('/submit')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-light shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Share Your Story
            </Button>
            <Button 
              variant="outline" 
              className="border-border hover:border-primary/50 hover:bg-primary/5 px-8 py-3 text-lg font-light backdrop-blur-sm"
            >
              Discover More
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProjects.map((project, index) => (
            <Card 
              key={project.id}
              className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 bg-card/80 backdrop-blur-sm hover:-translate-y-2"
              style={{
                background: `linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)) 50%, hsl(var(--muted)) 100%)`,
              }}
            >
              {/* Gradient overlay for visual interest */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="relative p-0">
                {/* Header Section */}
                <div className="p-6 pb-5 bg-gradient-to-r from-card via-card to-muted/20">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {project.name}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary"
                      onClick={() => window.open(project.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-foreground/70 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Elegant Separator with Color */}
                <div className="px-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                </div>

                {/* Story Section */}
                <div className="px-6 py-5 bg-gradient-to-r from-muted/10 to-accent/5">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-accent/40 rounded-full"></div>
                    <p className="text-sm italic text-foreground/80 leading-relaxed pl-6">
                      "{project.story}"
                    </p>
                  </div>
                </div>

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

                {/* Creator Section */}
                <div className="px-6 py-5 bg-gradient-to-r from-card to-muted/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`
                        }}
                      >
                        {project.creator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-foreground/80 font-medium">{project.creator.name}</span>
                    </div>
                    {project.creator.allowsContact && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs hover:bg-primary/10 hover:text-primary transition-all duration-300 h-8 px-3 border border-transparent hover:border-primary/20"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}
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
                          onClick={() => handleReaction(project.id, type)}
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
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-16">
          <Button 
            variant="outline" 
            className="border-border hover:border-primary/50 hover:bg-primary/5 font-light px-8 py-3 backdrop-blur-sm"
          >
            Load More Stories
          </Button>
        </div>
      </div>
    </div>
  );
}
