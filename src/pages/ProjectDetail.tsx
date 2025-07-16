import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Calendar, Globe, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  story: string;
  deeper_story?: string;
  link: string;
  tools: string[];
  screenshots: string[];
  creator_name: string;
  email: string;
  allows_contact: boolean;
  created_at: string;
  reactions: {
    heart: number;
    rocket: number;
    lightbulb: number;
  };
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProject();
      if (user) {
        fetchUserReaction();
      }
    }
  }, [id, user]);

  const fetchProject = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast({
          title: "Error",
          description: "Failed to load project details.",
          variant: "destructive"
        });
        navigate('/gallery');
        return;
      }

      // Fetch reactions for this project
      const { data: reactionsData, error: reactionsError } = await supabase
        .from('project_reactions')
        .select('reaction_type')
        .eq('project_id', id);

      if (reactionsError) {
        console.error('Error fetching reactions:', reactionsError);
      }

      // Aggregate reactions
      const reactions = { heart: 0, rocket: 0, lightbulb: 0 };
      reactionsData?.forEach(reaction => {
        if (reaction.reaction_type in reactions) {
          reactions[reaction.reaction_type as keyof typeof reactions]++;
        }
      });

      const project: Project = {
        ...projectData,
        reactions
      };

      setProject(project);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive"
      });
      navigate('/gallery');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReaction = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('project_reactions')
        .select('reaction_type')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user reaction:', error);
        return;
      }

      setUserReaction(data?.reaction_type || null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReaction = async (reactionType: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to projects.",
        variant: "destructive"
      });
      return;
    }

    if (!id || !project) return;

    try {
      const isCurrentReaction = userReaction === reactionType;

      if (isCurrentReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('project_reactions')
          .delete()
          .eq('project_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserReaction(null);
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from('project_reactions')
          .upsert({
            project_id: id,
            user_id: user.id,
            reaction_type: reactionType
          });

        if (error) throw error;
        setUserReaction(reactionType);
      }

      // Refresh project data to update reaction counts
      fetchProject();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive"
      });
    }
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'heart': return Heart;
      case 'rocket': return Rocket;
      case 'lightbulb': return Lightbulb;
      default: return Heart;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-subtle-grid bg-grid flex items-center justify-center">
        <div className="text-foreground">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background bg-subtle-grid bg-grid flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Project not found</h2>
          <Button onClick={() => navigate('/gallery')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-subtle-grid bg-grid">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/gallery')}
            className="mb-6 text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
                        {project.name}
                      </h1>
                      <div className="flex items-center gap-4 text-foreground/60 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Built by {project.creator_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => window.open(project.link, '_blank')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Live
                      </Button>
                      {project.allows_contact && (
                        <Button variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Builder
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tools.map((tool, index) => (
                      <Badge 
                        key={tool} 
                        variant="secondary"
                        className="bg-gradient-to-r from-secondary/80 to-muted/80 border border-border/30"
                      >
                        {tool}
                      </Badge>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Screenshots Gallery */}
            {project.screenshots && project.screenshots.length > 0 && (
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img 
                      src={project.screenshots[currentImageIndex]} 
                      alt={`${project.name} screenshot ${currentImageIndex + 1}`}
                      className="w-full h-96 object-cover"
                    />
                    {project.screenshots.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {project.screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              currentImageIndex === index 
                                ? 'bg-white shadow-lg' 
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {project.screenshots.length > 1 && (
                    <div className="p-4 border-t border-border/20">
                      <div className="flex gap-2 overflow-x-auto">
                        {project.screenshots.map((screenshot, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index 
                                ? 'border-primary' 
                                : 'border-border/30 hover:border-border/50'
                            }`}
                          >
                            <img 
                              src={screenshot} 
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Story Section */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-6">The Story</h2>
                <div className="prose prose-lg max-w-none">
                  <blockquote className="border-l-4 border-primary/40 pl-6 italic text-foreground/90 text-xl leading-relaxed mb-6">
                    "{project.story}"
                  </blockquote>
                  {project.deeper_story && (
                    <div className="text-foreground/80 leading-relaxed whitespace-pre-line">
                      {project.deeper_story}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reactions */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Show your appreciation</h3>
                <div className="space-y-3">
                  {Object.entries(project.reactions).map(([type, count]) => {
                    const Icon = getReactionIcon(type);
                    const isActive = userReaction === type;
                    const displayCount = count + (isActive ? 1 : 0);
                    
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="lg"
                        className={`w-full justify-between text-left transition-all duration-300 ${
                          isActive 
                            ? 'bg-primary/10 border-primary/30 text-primary' 
                            : 'hover:bg-muted/50 text-foreground/70 hover:text-foreground'
                        }`}
                        onClick={() => handleReaction(type)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <span className="text-lg font-bold">{displayCount}</span>
                      </Button>
                    );
                  })}
                </div>
                {!user && (
                  <p className="text-xs text-foreground/50 mt-4 text-center">
                    Sign in to react to this project
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Project Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      Visit Project
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <User className="h-4 w-4" />
                    <span>Created by {project.creator_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground/70">
                    <Calendar className="h-4 w-4" />
                    <span>Published {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}