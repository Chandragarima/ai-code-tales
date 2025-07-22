import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X, User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessagesPage } from './MessagesPage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Submit', path: '/submit' },
    ...(user ? [{ name: 'My Projects', path: '/my-projects' }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Load unread message count
  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        // Get all conversations where user is involved
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`creator_id.eq.${user.id},sender_id.eq.${user.id}`);

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Count unread messages
        const conversationIds = conversations.map(c => c.id);
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Real-time updates for message count
    const channel = supabase
      .channel('message-count-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isActivePath = (path: string) => location.pathname === path;

  if (showMessages) {
    return <MessagesPage onClose={() => setShowMessages(false)} />;
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-light bg-elegant-gradient bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              AI Gallery
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`font-light transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => setShowMessages(true)}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 hover:bg-primary/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {profile?.username ? profile.username.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-light">{profile?.username || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.username || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-primary hover:bg-primary/90 font-light"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md font-light transition-colors ${
                    isActivePath(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <div className="border-t border-border/50 mt-4 pt-4">
                {user ? (
                  <div className="space-y-2">
                    {/* Messages button for mobile */}
                    <button
                      onClick={() => {
                        setShowMessages(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-3 py-2 rounded-md font-light text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </button>
                    
                    <div className="flex items-center px-3 py-2 space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {profile?.username ? profile.username.slice(0, 2).toUpperCase() : user.email?.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{profile?.username || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md font-light text-foreground/70 hover:text-foreground hover:bg-muted/50"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md font-light text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md font-light bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};