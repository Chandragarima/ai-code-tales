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
              className="group relative overflow-hidden border-subtle-border hover:border-elegant-accent/20 transition-all duration-500 hover:shadow-xl hover:shadow-elegant-accent/5 bg-card backdrop-blur-sm"
            >
              <CardContent className="p-8">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-6">
                  <h3 className="text-2xl font-light text-foreground group-hover:text-elegant-accent transition-colors">
                    {project.name}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => window.open(project.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-text-elegant mb-6 text-base leading-relaxed font-light">
                  {project.description}
                </p>

                {/* Story Preview */}
                <div className="mb-6 p-4 bg-muted/20 rounded-lg border-l-4 border-elegant-accent/30">
                  <p className="text-base italic text-text-elegant font-light leading-relaxed">
                    "{project.story}"
                  </p>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tools.map((tool) => (
                    <Badge 
                      key={tool} 
                      variant="secondary"
                      className="text-sm bg-secondary/30 hover:bg-secondary/50 transition-colors font-light px-3 py-1"
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>

                {/* Creator & Contact */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-elegant-gradient rounded-full flex items-center justify-center text-background text-sm font-medium">
                      {project.creator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-base text-text-elegant font-light">{project.creator.name}</span>
                  </div>
                  {project.creator.allowsContact && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm font-light hover:bg-card-hover transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-4 pt-6 border-t border-subtle-border">
                  {Object.entries(project.reactions).map(([type, count]) => {
                    const Icon = getReactionIcon(type);
                    const isActive = userReactions[project.id] === type;
                    
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-2 text-sm font-light transition-colors ${
                          isActive ? 'text-elegant-accent' : 'text-text-elegant hover:text-foreground'
                        }`}
                        onClick={() => handleReaction(project.id, type)}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? 'fill-current' : ''}`} />
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