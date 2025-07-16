
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
    <div className="min-h-screen bg-background bg-subtle-grid bg-grid">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-7xl font-light mb-8 bg-elegant-gradient bg-clip-text text-transparent">
            Gallery
          </h1>
          <p className="text-xl text-text-elegant mb-12 max-w-2xl mx-auto font-light">
            Curated stories behind exceptional AI-built applications
          </p>
          <div className="flex gap-6 justify-center">
            <Button 
              onClick={() => navigate('/submit')}
              className="bg-elegant-accent text-background hover:bg-elegant-accent/90 px-8 py-3 text-lg font-light"
            >
              Share Your Story
            </Button>
            <Button 
              variant="outline" 
              className="border-subtle-border hover:border-elegant-accent/30 px-8 py-3 text-lg font-light"
            >
              Discover More
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {mockProjects.map((project) => (
            <Card 
              key={project.id}
              className="group relative overflow-hidden border-subtle-border hover:border-elegant-accent/30 transition-all duration-500 hover:shadow-xl hover:shadow-elegant-accent/10 bg-card backdrop-blur-sm"
            >
              <CardContent className="p-0">
                {/* Header Section */}
                <div className="p-6 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-medium text-foreground group-hover:text-elegant-accent transition-colors leading-tight">
                      {project.name}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8 shrink-0"
                      onClick={() => window.open(project.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-text-elegant text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Elegant Separator */}
                <div className="px-6">
                  <Separator className="bg-gradient-to-r from-transparent via-subtle-border to-transparent" />
                </div>

                {/* Story Section */}
                <div className="px-6 py-5 bg-muted/5">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-elegant-accent/20 rounded-full"></div>
                    <p className="text-sm italic text-text-elegant leading-relaxed pl-4">
                      "{project.story}"
                    </p>
                  </div>
                </div>

                {/* Elegant Separator */}
                <div className="px-6">
                  <Separator className="bg-gradient-to-r from-transparent via-subtle-border to-transparent" />
                </div>

                {/* Tools Section */}
                <div className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <Badge 
                        key={tool} 
                        variant="secondary"
                        className="text-xs bg-secondary/20 hover:bg-secondary/30 transition-colors px-3 py-1 border border-subtle-border/30"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Distinctive Separator with Accent */}
                <div className="px-6">
                  <div className="relative">
                    <Separator className="bg-subtle-border/40" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-elegant-accent/20 rounded-full"></div>
                  </div>
                </div>

                {/* Creator Section */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-elegant-gradient rounded-full flex items-center justify-center text-background text-xs font-medium shadow-sm">
                        {project.creator.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-text-elegant font-medium">{project.creator.name}</span>
                    </div>
                    {project.creator.allowsContact && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs hover:bg-muted/20 transition-colors h-8 px-3 border border-transparent hover:border-subtle-border/20"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Final Distinctive Separator */}
                <div className="px-6">
                  <div className="h-px bg-gradient-to-r from-elegant-accent/10 via-elegant-accent/30 to-elegant-accent/10"></div>
                </div>

                {/* Reactions Section */}
                <div className="px-6 py-4 bg-muted/3">
                  <div className="flex items-center gap-4">
                    {Object.entries(project.reactions).map(([type, count]) => {
                      const Icon = getReactionIcon(type);
                      const isActive = userReactions[project.id] === type;
                      
                      return (
                        <Button
                          key={type}
                          variant="ghost"
                          size="sm"
                          className={`flex items-center gap-1.5 text-xs transition-all duration-200 h-8 px-3 border border-transparent hover:border-subtle-border/20 ${
                            isActive 
                              ? 'text-elegant-accent bg-elegant-accent/5 border-elegant-accent/20' 
                              : 'text-text-elegant hover:text-foreground hover:bg-muted/10'
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
            className="border-subtle-border hover:border-elegant-accent/30 font-light px-8 py-3"
          >
            Load More Stories
          </Button>
        </div>
      </div>
    </div>
  );
}
