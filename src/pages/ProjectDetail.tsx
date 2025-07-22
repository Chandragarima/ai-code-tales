import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Calendar, Globe, User, Eye, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { MessageDialog } from '@/components/MessageDialog';

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
  user_id: string;
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
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [creatorAllowsContact, setCreatorAllowsContact] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      if (user) {
        fetchUserReaction();
      }
    }
  }, [id, user]);

  useEffect(() => {
    if (project) {
      checkCreatorContactSettings();
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

  const checkCreatorContactSettings = async () => {
    if (!project) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('allow_contact')
        .eq('user_id', project.user_id)
        .single();

      if (error) {
        console.error('Error checking creator contact settings:', error);
        return;
      }

      setCreatorAllowsContact(data?.allow_contact !== false);
    } catch (error) {
      console.error('Error checking creator contact settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#f6d365]/30 border-t-[#fda085] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Project not found</h2>
          <Button onClick={() => navigate('/gallery')} variant="outline" className="bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 hover:from-[#f6d365]/30 hover:to-[#fda085]/30 border-[#f6d365]/30 hover:border-[#f6d365]/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/gallery')}
            className="mb-4 sm:mb-6 text-foreground/70 hover:text-[#fda085] text-sm sm:text-base transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Project Header - Most Important */}
            <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardContent className="relative p-0">
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] flex-shrink-0">
                          {project.creator_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground mb-1 font-normal">Built by {project.creator_name}</p>
                          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight group-hover:text-[#f6d365] transition-colors duration-300">
                            {project.name}
                          </h1>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-foreground/60 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        onClick={() => window.open(project.link, '_blank')}
                        className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#fda085]/20 transition-all duration-300 hover:scale-105"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Live
                      </Button>
                      {user && creatorAllowsContact && user.id !== project.user_id && (
                        <Button 
                          variant="outline"
                          onClick={() => setShowMessageDialog(true)}
                          className="bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 hover:from-[#f6d365]/30 hover:to-[#fda085]/30 text-foreground hover:text-[#fda085] transition-all duration-300 border-[#f6d365]/30 hover:border-[#f6d365]/50"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Creator
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Tools */}
                  <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                    {project.tools.map((tool, index) => (
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
                  </div>

                  {/* Description */}
                  <p className="text-foreground/80 text-base sm:text-lg leading-relaxed">
                    {project.description}
                  </p>
                  
                  {/* Subtle connection hint */}
                  {project.allows_contact && creatorAllowsContact && (
                    <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-[#f6d365]/5 to-[#fda085]/5 border border-[#f6d365]/20">
                      <div className="flex items-center gap-2 text-sm text-foreground/70">
                        <MessageCircle className="h-4 w-4 text-[#fda085]" />
                        <span>Want to learn more? <span className="text-[#fda085] font-medium">Connect with the creator</span> in the sidebar.</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Story Section - Moved up for better engagement */}
            <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardContent className="relative p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <Sparkles className="h-5 w-5 text-[#fda085]" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">The Story</h2>
                </div>
                <div className="prose prose-lg max-w-none">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#f6d365] to-[#fda085] rounded-full"></div>
                    <div className="pl-4 sm:pl-6">
                      <blockquote className="text-base sm:text-lg lg:text-xl leading-relaxed italic text-foreground/90 mb-4 sm:mb-6">
                        "{project.story}"
                      </blockquote>
                    </div>
                  </div>
                  {project.deeper_story && (
                    <div className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {project.deeper_story}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Screenshots Gallery - Moved down as supporting content */}
            {project.screenshots && project.screenshots.length > 0 && (
              <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="relative p-0">
                  <div className="relative">
                    <img 
                      src={project.screenshots[currentImageIndex]} 
                      alt={`${project.name} screenshot ${currentImageIndex + 1}`}
                      className="w-full h-48 sm:h-64 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    {project.screenshots.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {project.screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all ${
                              currentImageIndex === index 
                                ? 'bg-gradient-to-r from-[#f6d365] to-[#fda085] shadow-lg' 
                                : 'bg-white/50 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {project.screenshots.length > 1 && (
                    <div className="p-3 sm:p-4 border-t border-white/10">
                      <div className="flex gap-2 overflow-x-auto">
                        {project.screenshots.map((screenshot, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-16 sm:w-20 h-12 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index 
                                ? 'border-[#fda085] shadow-lg' 
                                : 'border-border/30 hover:border-[#f6d365]/50'
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
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Connect with Creator - Moved to top for immediate visibility */}
            {project.allows_contact && creatorAllowsContact && (
              <Card className="group relative overflow-hidden border-[#f6d365]/30 hover:border-[#fda085]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/10 bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-sm hover:-translate-y-1">
                {/* Subtle brand gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Highlight indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f6d365] to-[#fda085] opacity-60"></div>
                
                <CardContent className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f6d365] to-[#fda085] flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Connect with Creator</h3>
                      <p className="text-xs text-[#fda085] font-medium">Platform Feature</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-foreground/80 text-sm leading-relaxed">
                      Have questions about this project? Want to collaborate or share feedback? 
                      <span className="text-[#fda085] font-medium"> Reach out directly to the creator.</span>
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <div className="w-2 h-2 rounded-full bg-[#f6d365]"></div>
                      <span>Direct messaging with project creators</span>
                    </div>
                    
                    <Button 
                      onClick={() => setShowMessageDialog(true)}
                      className="w-full bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-[#fda085]/20"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message {project.creator_name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reactions - Moved down as secondary interaction */}
            <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm lg:sticky lg:top-8 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardContent className="relative p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Show your appreciation</h3>
                <div className="space-y-2 sm:space-y-3">
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
                            ? 'bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 border-[#f6d365]/30 text-[#fda085]' 
                            : 'hover:bg-gradient-to-r hover:from-[#f6d365]/10 hover:to-[#fda085]/10 text-foreground/70 hover:text-foreground'
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
          </div>
        </div>
      </div>

      {showMessageDialog && project && (
        <MessageDialog
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
          projectId={project.id}
          creatorId={project.user_id}
          creatorName={project.creator_name}
          projectName={project.name}
        />
      )}
    </div>
  );
}