import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Heart, Rocket, Lightbulb, MessageCircle, Calendar, Globe, User, Eye, Sparkles, Mail, Github, Twitter, Linkedin } from "lucide-react";
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

interface CreatorProfile {
  allow_contact: boolean;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [project, setProject] = useState<Project | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

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

      // Fetch creator profile
      await fetchCreatorProfile(projectData.user_id);
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

  const fetchCreatorProfile = async (creatorId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('allow_contact, bio, website, github, twitter, linkedin')
        .eq('user_id', creatorId)
        .single();

      if (error) {
        console.error('Error fetching creator profile:', error);
        return;
      }

      setCreatorProfile(data);
    } catch (error) {
      console.error('Error fetching creator profile:', error);
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
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType);

        if (error) throw error;
        setUserReaction(null);
      } else {
        // First, delete any existing reaction by this user for this project
        if (userReaction) {
          const { error: deleteError } = await supabase
            .from('project_reactions')
            .delete()
            .eq('project_id', id)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
        }

        // Then insert the new reaction
        const { error } = await supabase
          .from('project_reactions')
          .insert({
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

  const canContactCreator = () => {
    return project?.allows_contact && 
           creatorProfile?.allow_contact && 
           user?.id !== project.user_id;
  };

  const shouldShowConnectSection = () => {
    return project?.allows_contact && creatorProfile?.allow_contact;
  };

  const shouldShowAboutCreator = () => {
    // Only show "About the Creator" if there's no "Connect with Creator" section
    return !shouldShowConnectSection() && creatorProfile;
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
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/gallery')}
            className="mb-6 text-foreground/70 hover:text-[#fda085] text-sm sm:text-base transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Header - Name and Description First */}
            <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <CardContent className="relative p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] flex-shrink-0">
                        {project.creator_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground mb-2 font-medium">Built by {project.creator_name}</p>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight group-hover:text-[#f6d365] transition-colors duration-300">
                          {project.name}
                        </h1>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-foreground/60 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Project Details</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => window.open(project.link, '_blank')}
                      className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#fda085]/20 transition-all duration-300 hover:scale-105"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live
                    </Button>
                  </div>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tools.map((tool, index) => (
                    <Badge 
                      key={tool} 
                      variant="secondary"
                      className={`text-xs px-3 py-1.5 border transition-all duration-300 ${
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
                <p className="text-foreground/80 text-lg leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Story Section */}
            <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-6 w-6 text-[#fda085]" />
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">The Story</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Main Story - Always shown as a quote */}
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f6d365] to-[#fda085] rounded-full"></div>
                    <div className="pl-6">
                      <blockquote className="text-base sm:text-lg lg:text-xl leading-relaxed italic text-foreground/90 font-medium">
                        "{project.story}"
                      </blockquote>
                    </div>
                  </div>
                  
                  {/* Detailed Story - Only shown if exists */}
                  {project.deeper_story && (
                    <div className="border-t border-border/30 pt-6">
                      <div className="prose prose-lg max-w-none">
                        <div className="text-foreground/80 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                          {project.deeper_story}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Screenshots Gallery - Integrated carefully */}
            {project.screenshots && project.screenshots.length > 0 && (
              <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#fda085]/5 bg-card/90 backdrop-blur-sm hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="relative p-0">
                  <div className="relative">
                    <img 
                      src={project.screenshots[currentImageIndex]} 
                      alt={`${project.name} screenshot ${currentImageIndex + 1}`}
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    {project.screenshots.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {project.screenshots.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
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
                    <div className="p-4 border-t border-white/10">
                      <div className="flex gap-2 overflow-x-auto">
                        {project.screenshots.map((screenshot, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
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
          <div className="space-y-6">
            {/* Connect with Creator - Prominent placement */}
            {shouldShowConnectSection() && (
              <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6d365] to-[#fda085] flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Connect with Creator</h3>
                      <p className="text-sm text-muted-foreground">
                        {user ? 'Direct messaging available' : 'Sign in to connect'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                    {user ? (
                      <>
                        Have questions about this project? Want to collaborate or share feedback? 
                        <span className="text-[#fda085] font-medium"> Reach out directly to {project.creator_name}.</span>
                      </>
                    ) : (
                      <>
                        Want to connect with {project.creator_name}? 
                        <span className="text-[#fda085] font-medium"> Sign in to start a conversation.</span>
                      </>
                    )}
                  </p>
                  
                                      <Button 
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "Sign in required",
                            description: "Please sign in to message the creator.",
                            variant: "destructive"
                          });
                          return;
                        }
                        if (user.id === project.user_id) {
                          toast({
                            title: "Cannot message yourself",
                            description: "You cannot send a message to yourself.",
                            variant: "destructive"
                          });
                          return;
                        }
                        setShowMessageDialog(true);
                      }}
                      variant="outline"
                      className="w-full border-border/50 hover:border-[#fda085]/50 text-foreground/80 hover:text-[#fda085] bg-transparent hover:bg-[#fda085]/5 font-medium py-2.5 rounded-lg transition-all duration-300"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {user ? `Message ${project.creator_name}` : 'Sign in to Message'}
                    </Button>
                </CardContent>
              </Card>
            )}

            {/* About Creator - Only show when no Connect section exists */}
            {shouldShowAboutCreator() && (
              <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6d365] to-[#fda085] flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">About the Creator</h3>
                      <p className="text-sm text-muted-foreground">{project.creator_name}</p>
                    </div>
                  </div>
                  
                  {creatorProfile.bio && (
                    <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                      {creatorProfile.bio}
                    </p>
                  )}
                  
                  {/* Social Links */}
                  <div className="space-y-2">
                    {creatorProfile.website && (
                      <a href={creatorProfile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-[#fda085] transition-colors">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                    {creatorProfile.github && (
                      <a href={creatorProfile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-[#fda085] transition-colors">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </a>
                    )}
                    {creatorProfile.twitter && (
                      <a href={creatorProfile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-[#fda085] transition-colors">
                        <Twitter className="h-4 w-4" />
                        <span>Twitter</span>
                      </a>
                    )}
                    {creatorProfile.linkedin && (
                      <a href={creatorProfile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-foreground/70 hover:text-[#fda085] transition-colors">
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reactions - Simplified design */}
            <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6d365] to-[#fda085] flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Show Your Appreciation</h3>
                    <p className="text-sm text-muted-foreground">Support the creator</p>
                  </div>
                </div>
                
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  Loved this project? Show your appreciation and support the creator's work.
                </p>
                
                <div className="space-y-2">
                  {Object.entries(project.reactions).map(([type, count]) => {
                    const Icon = getReactionIcon(type);
                    const isActive = userReaction === type;
                    
                    return (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-between text-left h-auto py-2 ${
                          isActive 
                            ? 'bg-[#fda085]/10 text-[#fda085]' 
                            : 'hover:bg-muted/50 text-foreground/70 hover:text-foreground'
                        }`}
                        onClick={() => handleReaction(type)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-4 w-4 ${isActive ? 'text-[#fda085]' : 'text-muted-foreground'}`} />
                          <span className="font-medium capitalize text-sm">{type}</span>
                        </div>
                        <span className="text-sm font-medium text-[#fda085]">{count}</span>
                      </Button>
                    );
                  })}
                </div>
                
                {!user && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-foreground/70 text-center">
                      Sign in to show your appreciation
                    </p>
                  </div>
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