import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageInterface } from './MessageInterface';

interface ConversationWithDetails {
  id: string;
  project_id: string;
  creator_id: string;
  sender_id: string;
  created_at: string;
  updated_at: string;
  project: {
    name: string;
    creator_name: string;
  };
  creator_profile: {
    username: string;
    avatar_url: string | null;
  } | null;
  sender_profile: {
    username: string;
    avatar_url: string | null;
  } | null;
  unread_count: number;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
}

interface MessagesPageProps {
  onClose?: () => void;
}

export function MessagesPage({ onClose }: MessagesPageProps) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Real-time updates for conversations with fallback
  useEffect(() => {
    if (!user) return;

    let isRealtimeConnected = false;
    let pollInterval: NodeJS.Timeout;

    const channel = supabase
      .channel('conversation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          console.log('Real-time conversation update detected');
          loadConversations();
        }
      )
      .on('system', {}, (payload) => {
        if (payload.status === 'SUBSCRIBED') {
          isRealtimeConnected = true;
        } else if (payload.status === 'CHANNEL_ERROR') {
          isRealtimeConnected = false;
        }
      })
      .subscribe();

    // Fallback polling for conversation updates
    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (!isRealtimeConnected) {
          console.log('Polling for conversation updates (real-time unavailable)');
          loadConversations();
        }
      }, 5000); // Poll every 5 seconds for conversation list
    };

    const pollTimeoutId = setTimeout(startPolling, 5000);

    return () => {
      clearTimeout(pollTimeoutId);
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      // Get conversations where user is either creator or sender
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`creator_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Deduplicate conversations by project_id and user pair
      const uniqueConversations = new Map<string, any>();
      
      (conversationsData || []).forEach(conv => {
        // Create a unique key for the conversation based on project and the other user
        const otherUserId = conv.creator_id === user.id ? conv.sender_id : conv.creator_id;
        const conversationKey = `${conv.project_id}_${otherUserId}`;
        
        // Keep the most recent conversation for each unique project-user pair
        if (!uniqueConversations.has(conversationKey) || 
            new Date(conv.updated_at) > new Date(uniqueConversations.get(conversationKey)!.updated_at)) {
          uniqueConversations.set(conversationKey, conv);
        }
      });

      // Load additional data for each unique conversation
      const conversationsWithDetails = await Promise.all(
        Array.from(uniqueConversations.values()).map(async (conv) => {
          // Get project, creator and sender profiles
          const [projectData, creatorProfile, senderProfile, messagesResult] = await Promise.all([
            supabase
              .from('projects')
              .select('name, creator_name')
              .eq('id', conv.project_id)
              .single(),
            supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('user_id', conv.creator_id)
              .single(),
            supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('user_id', conv.sender_id)
              .single(),
            supabase
              .from('messages')
              .select('content, created_at, sender_id, is_read')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
          ]);

          const messages = messagesResult.data || [];
          const unreadCount = messages.filter(msg => 
            !msg.is_read && msg.sender_id !== user.id
          ).length;

          return {
            ...conv,
            project: projectData.data,
            creator_profile: creatorProfile.data,
            sender_profile: senderProfile.data,
            unread_count: unreadCount,
            last_message: messages[0] || null
          };
        })
      );

      // Sort by most recent activity
      conversationsWithDetails.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: ConversationWithDetails) => {
    if (conversation.creator_id === user?.id) {
      return {
        id: conversation.sender_id,
        profile: conversation.sender_profile,
        fallbackName: 'User'
      };
    } else {
      return {
        id: conversation.creator_id,
        profile: conversation.creator_profile,
        fallbackName: conversation.project?.creator_name || 'Creator'
      };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // if (loading) {
  //   return (
  //     <div className={onClose ? "fixed inset-0 bg-background z-50 flex items-center justify-center" : "min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center"}>
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-foreground/70">Loading conversations...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Show message interface if conversation is selected
  if (selectedConversation) {
    const otherUser = getOtherUser(selectedConversation);
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
        <div className="relative h-screen flex flex-col">
          <MessageInterface
            projectId={selectedConversation.project_id}
            creatorId={
              selectedConversation.creator_id === user?.id 
                ? selectedConversation.sender_id 
                : selectedConversation.creator_id
            }
            creatorName={
              selectedConversation.creator_id === user?.id
                ? selectedConversation.sender_profile?.username || 'User'
                : selectedConversation.creator_profile?.username || selectedConversation.project?.creator_name || 'Creator'
            }
            projectName={selectedConversation.project?.name || 'Project'}
            onBack={() => setSelectedConversation(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <Button 
        variant="ghost"
        size="sm"
        onClick={onClose || (() => navigate(-1))}
        className="md:hidden fixed top-14 left-3 z-50 h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border border-border/30 rounded-lg shadow-md hover:shadow-lg hover:bg-accent/20 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Button>
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#f6d365]/5 to-[#fda085]/5 rounded-full blur-3xl pointer-events-none"></div>
       */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 max-w-5xl mx-auto">
        {/* Compact Header Bar - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          {/* Mobile Header Bar */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <div className="w-10"></div> {/* Spacer for centering */}
            
            <h1 className="font-['Playfair_Display'] text-xl font-normal bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
              Messages
            </h1>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block text-center">
            <div className="flex flex-col items-center space-y-6 lg:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                Messages
              </h1>
              {/* Divider */}
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              {/* Subtitle */}
              <p className="text-sm lg:text-base text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
                Connect with creators and fellow builders through meaningful conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        {/* <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 bg-card/90 backdrop-blur-sm"> */}
          {/* Subtle gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
          
          <CardContent className="relative p-3 sm:p-6 lg:p-8">
            {conversations.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                {/* <div className="w-16 h-16 bg-gradient-to-br from-[#f6d365]/20 to-[#fda085]/20 rounded-full flex items-center justify-center mx-auto mb-6"> */}
                  {/* <MessageSquare className="h-8 w-8 text-muted-foreground/70" /> */}
                {/* </div> */}
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No messages yet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  <span className="block sm:hidden">Start a conversation by messaging a creator from the gallery</span>
                  <span className="hidden sm:block">Start a conversation by messaging a project creator from the gallery</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const isOwnMessage = conversation.last_message?.sender_id === user?.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      className="group relative overflow-hidden rounded-lg sm:rounded-xl border border-border/30 hover:border-white/20 transition-all duration-200 cursor-pointer bg-card/40 backdrop-blur-sm hover:bg-card/60"
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      {/* Subtle gradient overlay on hover */}
                      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div> */}
                      
                      <div className="relative p-3 sm:p-4 lg:p-6">
                        {/* Header with avatar and user info */}
                        <div className="flex items-start gap-3 sm:gap-4 mb-2 sm:mb-3">
                          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                            <AvatarImage src={otherUser.profile?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-[#f6d365] to-[#fda085] text-white font-medium text-xs sm:text-sm">
                              {(otherUser.profile?.username || otherUser.fallbackName)[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
                                {otherUser.profile?.username || otherUser.fallbackName}
                              </h3>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {conversation.unread_count > 0 && (
                                  <Badge variant="destructive" className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 h-4 sm:h-5 min-w-[16px] sm:min-w-[20px] flex items-center justify-center">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                                {conversation.last_message && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatTime(conversation.last_message.created_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {conversation.project?.name}
                            </p>
                          </div>
                        </div>

                        {/* Message content with bubble styling */}
                        {conversation.last_message && (
                          <div className="ml-11 sm:ml-14">
                            <div className={`inline-block max-w-full rounded-lg px-3 sm:px-4 py-1 ${
                              isOwnMessage 
                                ? 'bg-muted/60 text-white ml-auto shadow-sm' 
                                : 'bg-[white] text-black border border-border/50'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {isOwnMessage && (
                                  <span className="text-xs font-medium text-white/70">You</span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm leading-relaxed break-words">
                                {conversation.last_message.content.length > 80 
                                  ? `${conversation.last_message.content.substring(0, 80)}...`
                                  : conversation.last_message.content
                                }
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        {/* </Card> */}
      </div>
    </div>
  );
}