import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { name: 'Gallery', path: '/gallery' },
    { name: 'Submit', path: '/submit' },
    ...(user ? [{ name: 'My Projects', path: '/my-projects' }, { name: 'Messages', path: '/messages' }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Load unread message count
  useEffect(() => {
    if (!user) return;

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

  // Listen for message read events to update unread count
  useEffect(() => {
    const handleMessageRead = () => {
      if (user) {
        loadUnreadCount();
      }
    };

    window.addEventListener('message-read', handleMessageRead);
    return () => {
      window.removeEventListener('message-read', handleMessageRead);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;
    
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`creator_id.eq.${user.id},sender_id.eq.${user.id}`);

      if (!conversations || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

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

  const isActivePath = (path: string) => location.pathname === path;

  const getDisplayName = () => {
    if (profile?.username) {
      return profile.username;
    }
    return user?.email || 'User';
  };

  const getDisplayInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 hover:scale-105 transition-all duration-300 group"
            >
              {/* Logo Icon */}
              <div className="relative">
                {/* Code bracket icon with modern gradient */}
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300">
                  <span className="text-white font-mono text-base lg:text-lg font-bold">&lt;/&gt;</span>
                </div>
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
              </div>
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-xl lg:text-2xl leading-none tracking-tight">AI Code</span>
                <span className="text-muted-foreground font-medium text-sm lg:text-base leading-none tracking-widest">STORIES</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center space-x-2 lg:space-x-4 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-2 px-4 lg:px-6 py-2.5 rounded-full font-medium transition-all duration-300 group ${
                  isActivePath(item.path)
                    ? 'text-foreground bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-border/40 border border-transparent'
                }`}
              >
                <span className="text-sm lg:text-base font-medium">{item.name}</span>
                {item.path === '/messages' && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                {/* Active indicator */}
                {isActivePath(item.path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-full hover:bg-muted/80 transition-all duration-300 border border-transparent hover:border-border/40"
                  >
                    <Avatar className="w-9 h-9 lg:w-10 lg:h-10 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white text-sm font-medium">
                        {getDisplayInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm lg:text-base hidden lg:block">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/60 shadow-xl rounded-xl">
                  <div className="px-4 py-3 border-b border-border/20">
                    <p className="text-sm font-semibold text-foreground">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="hover:bg-muted/80 cursor-pointer mx-2 my-1 rounded-lg"
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/30 mx-2" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer mx-2 my-1 rounded-lg"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 rounded-full px-6 py-2"
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
              className="rounded-full hover:bg-muted/80 transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-card/98 backdrop-blur-xl shadow-lg">
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActivePath(item.path)
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="text-base">{item.name}</span>
                  {item.path === '/messages' && unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
              
              <div className="border-t border-border/40 mt-6 pt-6">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center px-4 py-4 bg-muted/30 rounded-xl">
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                        <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white text-sm font-medium">
                          {getDisplayInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-base font-semibold text-foreground">{getDisplayName()}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300"
                    >
                      <User className="mr-3 h-5 w-5" />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 rounded-xl font-medium text-destructive hover:bg-destructive/10 transition-all duration-300"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
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