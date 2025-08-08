import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Conversation {
  id: string;
  project_id: string;
  creator_id: string;
  sender_id: string;
}

interface Profile {
  username: string;
  avatar_url: string | null;
}

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  creatorId: string;
  creatorName: string;
  projectName: string;
}

export function MessageDialog({ 
  isOpen, 
  onClose, 
  projectId, 
  creatorId, 
  creatorName,
  projectName 
}: MessageDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && user) {
      loadConversation();
      loadCreatorProfile();
    }
  }, [isOpen, user, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time message updates with fallback
  useEffect(() => {
    if (!conversation?.id) return;

    let isRealtimeConnected = false;
    let pollInterval: NodeJS.Timeout;

    const channel = supabase
      .channel(`messages-dialog-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('Real-time message received in dialog:', payload);
          const newMessage = payload.new as Message;
          
          // Only add if not a temporary optimistic message
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            
            // Remove any temporary message and add the real one
            const filtered = prev.filter(msg => !msg.id.startsWith('temp-'));
            return [...filtered, newMessage];
          });
          
          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
            window.dispatchEvent(new CustomEvent('message-read'));
          }
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

    // Fallback polling mechanism
    const startPolling = () => {
      pollInterval = setInterval(() => {
        if (!isRealtimeConnected) {
          loadMessages(conversation.id);
        }
      }, 3000);
    };

    const pollTimeoutId = setTimeout(startPolling, 5000);

    return () => {
      clearTimeout(pollTimeoutId);
      if (pollInterval) clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, user?.id]);

  const loadCreatorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('user_id', creatorId)
        .single();

      if (error) throw error;
      setCreatorProfile(data);
    } catch (error) {
      console.error('Error loading creator profile:', error);
    }
  };

  const loadConversation = async () => {
    if (!user) return;

    try {
      // Find existing conversation between current user and creator for this project (both directions)
      const { data: existingConversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .or(`and(creator_id.eq.${user.id},sender_id.eq.${creatorId}),and(creator_id.eq.${creatorId},sender_id.eq.${user.id})`)
        .order('updated_at', { ascending: false });

      if (convError) {
        throw convError;
      }

      if (existingConversations && existingConversations.length > 0) {
        const primaryConversation = existingConversations[0];
        setConversation(primaryConversation);
        loadMessages(primaryConversation.id);
      } else {
        // Do NOT auto-create a conversation on open; wait until the first message is sent
        setConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation.",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      const unreadMessages = data?.filter(msg => 
        !msg.is_read && msg.sender_id !== user?.id
      ) || [];

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', messageIds);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // Ensure conversation exists (create on first send)
    let conversationId = conversation?.id;
    try {
      if (!conversationId) {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            project_id: projectId,
            creator_id: creatorId,
            sender_id: user.id,
          })
          .select()
          .single();
        if (createError) throw createError;
        conversationId = newConv.id;
        setConversation(newConv);
      }

      // Create optimistic message for immediate feedback
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === optimisticMessage.id ? { ...data, is_read: false } : msg))
      );

      // Manually refresh messages after a short delay
      setTimeout(() => {
        if (conversationId) {
          loadMessages(conversationId);
        }
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error and restore input
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      setNewMessage(messageContent);
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] h-[90vh] max-h-[700px] flex flex-col p-0 bg-gradient-to-br from-background via-background to-muted/20 border-border/50 z-[100]">
        <DialogHeader className="sr-only">
          <DialogTitle>Message with {creatorProfile?.username || creatorName}</DialogTitle>
        </DialogHeader>
        {/* Header */}
        <div className="relative flex items-center gap-3 p-4 sm:p-6 bg-card/80 backdrop-blur-md border-b border-border/50">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-border/50">
            <AvatarImage src={creatorProfile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] text-white font-semibold text-sm sm:text-base">
              {creatorProfile?.username?.[0]?.toUpperCase() || creatorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate text-sm sm:text-base lg:text-lg">
              {creatorProfile?.username || creatorName}
            </h3>
            <p className="text-muted-foreground truncate text-xs sm:text-sm">{projectName}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
          >
            {/* <X className="h-4 w-4 sm:h-5 sm:w-5" /> */}
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
          <div className="space-y-3 max-w-4xl mx-auto">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender_id !== message.sender_id);
              const showTime = index === messages.length - 1 || 
                messages[index + 1]?.sender_id !== message.sender_id ||
                new Date(messages[index + 1]?.created_at).getTime() - new Date(message.created_at).getTime() > 300000; // 5 minutes

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 sm:gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for received messages */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={creatorProfile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] text-white text-xs sm:text-sm">
                            {creatorProfile?.username?.[0]?.toUpperCase() || creatorName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 sm:h-10 sm:w-10" />
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] lg:max-w-[65%] min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-sm max-w-full ${
                        isOwn
                          ? 'bg-primary/90 text-primary-foreground rounded-br-md border border-primary/20'
                          : 'bg-card/60 text-card-foreground rounded-bl-md border border-border/30 backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words overflow-hidden word-wrap">
                        {message.content}
                      </p>
                    </div>
                    
                    {/* Message status and time */}
                    {showTime && (
                      <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {isOwn && (
                          <div className="flex items-center">
                            {message.is_read ? (
                              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-primary/70" />
                            ) : (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/60" />
                            )}
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground/70">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Spacer for sent messages */}
                  {isOwn && <div className="w-10 sm:w-12 flex-shrink-0" />}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-md border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 sm:gap-4 items-end">
              <div className="flex-1 relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[44px] sm:min-h-[48px] max-h-[120px] resize-none rounded-2xl border-border bg-background focus:ring-2 focus:ring-[#fda085] focus:border-transparent pr-12 text-sm sm:text-base"
                  disabled={loading}
                  rows={1}
                />
              </div>
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || loading}
                size="icon"
                className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}