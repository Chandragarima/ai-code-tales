import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, User, LogOut, Image, Plus, FolderOpen, MessageSquare } from 'lucide-react';
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
  const { user, profile, loading, signOut, refreshProfile } = useAuth();

  const navItems = [
    { name: 'Gallery', path: '/gallery', icon: Image, label: 'Gallery' },
    { name: 'Submit', path: '/submit', icon: Plus, label: 'Submit' },
    ...(user ? [
      { name: 'My Projects', path: '/my-projects', icon: FolderOpen, label: 'Projects' }, 
      { name: 'Messages', path: '/messages', icon: MessageSquare, label: 'Messages' }
    ] : []),
  ];

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    try {
      console.log('Calling signOut from AuthContext...');
      await signOut();
      console.log('SignOut completed successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      console.log('Navigating to home...');
      navigate('/');
    }
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

  // Listen for profile updates to refresh navbar profile data
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (user) {
        refreshProfile();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [user, refreshProfile]);

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
    if (loading) {
      return 'Loading...';
    }
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
    <nav className="sticky top-0 z-50 bg-background/98 backdrop-blur-2xl border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Logo - Compact */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 group transition-transform group-hover:scale-105"
            >
              <img 
                src="/lovable-uploads/7bd6dc8c-932d-4c87-837c-0ac6032f2735.png" 
                alt="AI Code Tales" 
                className="h-8 sm:h-10 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label || item.name}</span>
                  {item.path === '/messages' && unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs ml-1"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 px-2 py-2 rounded-full hover:bg-muted/50 h-auto"
                  >
                    <Avatar className="w-8 h-8 ring-1 ring-border">
                      <AvatarImage src={(profile as any)?.avatar_url || ''} alt={getDisplayName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getDisplayInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm hidden lg:block max-w-24 truncate">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                className="rounded-full font-medium"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile/Tablet Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {/* Show icons for key actions on mobile */}
            <div className="flex items-center gap-1">
              {navItems.slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`p-2 rounded-full transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              {/* Navigation items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActivePath(item.path)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.path === '/messages' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
              
              {/* User section */}
              <div className="pt-4 mt-4 border-t border-border/30">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={(profile as any)?.avatar_url || ''} alt={getDisplayName()} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getDisplayInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left hover:bg-muted/50"
                    >
                      <User className="w-5 h-5" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};