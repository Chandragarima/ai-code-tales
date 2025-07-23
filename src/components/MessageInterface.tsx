import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, Check, CheckCheck } from 'lucide-react';
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

interface MessageInterfaceProps {
  projectId: string;
  creatorId: string;
  creatorName: string;
  projectName: string;
  onBack: () => void;
}

export function MessageInterface({ 
  projectId, 
  creatorId, 
  creatorName,
  projectName,
  onBack
}: MessageInterfaceProps) {
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
    if (user) {
      loadConversation();
      loadCreatorProfile();
    }
  }, [user, projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time message updates
  useEffect(() => {
    if (!conversation?.id) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
            window.dispatchEvent(new CustomEvent('message-read'));
          }
        }
      )
      .subscribe();

    return () => {
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

    console.log('Loading conversation for user:', user.id, 'project:', projectId, 'creator:', creatorId);

    try {
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('project_id', projectId)
        .eq('sender_id', user.id)
        .single();

      console.log('Existing conversation query result:', existingConversation, 'Error:', convError);

      if (convError && convError.code !== 'PGRST116') {
        throw convError;
      }

      if (existingConversation) {
        setConversation(existingConversation);
        loadMessages(existingConversation.id);
      } else {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            project_id: projectId,
            creator_id: creatorId,
            sender_id: user.id
          })
          .select()
          .single();

        if (createError) throw createError;
        setConversation(newConversation);
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

      const unreadMessages = data?.filter(msg => 
        !msg.is_read && msg.sender_id !== user?.id
      ) || [];

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id);
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', messageIds);
        
        // Dispatch event to update notification badge
        window.dispatchEvent(new CustomEvent('message-read'));
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
    if (!newMessage.trim() || !conversation || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const isOwnMessage = (message: Message) => {
    console.log('Checking message:', message.id, 'sender_id:', message.sender_id, 'user?.id:', user?.id, 'isOwn:', message.sender_id === user?.id);
    return message.sender_id === user?.id;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
       */}
      {/* Header */}
      <div className="relative flex items-center gap-3 p-4 sm:p-6 bg-card/80 backdrop-blur-md border-b border-border/50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
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
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-3 max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const isOwn = isOwnMessage(message);
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
                        {formatTime(message.created_at)}
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
    </div>
  );
}