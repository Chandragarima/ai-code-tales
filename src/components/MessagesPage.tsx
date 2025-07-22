import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageDialog } from './MessageDialog';

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
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Real-time updates for conversations
  useEffect(() => {
    if (!user) return;

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
          loadConversations();
        }
      )
      .subscribe();

    return () => {
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

      // Load additional data for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
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

  if (loading) {
    return (
      <div className={onClose ? "fixed inset-0 bg-background z-50 flex items-center justify-center" : "min-h-screen bg-background bg-subtle-grid bg-grid flex items-center justify-center"}>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="text-center">Loading conversations...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={onClose ? "fixed inset-0 bg-background z-50" : "min-h-screen bg-background bg-subtle-grid bg-grid"}>
      <div className={onClose ? "h-full" : "container mx-auto px-6 py-16"}>
        <Card className="max-w-2xl mx-auto h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
            </div>
          </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start a conversation by messaging a project creator</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                return (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <Avatar>
                      <AvatarImage src={otherUser.profile?.avatar_url || ''} />
                      <AvatarFallback>
                        {(otherUser.profile?.username || otherUser.fallbackName)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {otherUser.profile?.username || otherUser.fallbackName}
                        </p>
                        <div className="flex items-center gap-2">
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
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
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.project?.name}
                      </p>
                      {conversation.last_message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                          {conversation.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        </Card>
      </div>

      {selectedConversation && (
        <MessageDialog
          isOpen={!!selectedConversation}
          onClose={() => setSelectedConversation(null)}
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
        />
      )}
    </div>
  );
}