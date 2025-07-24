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
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
            >
              {/* Logo Icon */}
              <div className="relative">
                {/* Code bracket icon */}
                <div className="w-8 h-8 border-2 border-[#fda085] rounded flex items-center justify-center">
                  <span className="text-[#fda085] font-mono text-sm font-bold">&lt;/&gt;</span>
                </div>
                {/* Speech bubble overlay */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full opacity-90 group-hover:scale-110 transition-transform duration-200"></div>
              </div>
              {/* Logo Text */}
              <div className="flex flex-col">
                <span className="text-[#fda085] font-semibold text-lg leading-none">AI Code</span>
                <span className="text-[#fda085] font-semibold text-sm leading-none">STORIES</span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-2 font-light transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'text-[#fda085] border-b-2 border-[#fda085]'
                    : 'text-foreground/70 hover:text-foreground hover:text-[#fda085]'
                }`}
              >
                <span className="text-sm lg:text-base">{item.name}</span>
                {item.path === '/messages' && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
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
                    className="flex items-center space-x-3 hover:bg-muted/50 transition-all duration-200"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-[#f6d365] to-[#fda085] text-white text-xs font-medium">
                        {getDisplayInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-light text-sm lg:text-base">{getDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border/50">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="hover:bg-muted/50 cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-black font-light shadow-sm"
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
              className="hover:bg-muted/50"
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
          <div className="md:hidden border-t border-border/30 bg-card/95 backdrop-blur-sm">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-3 rounded-lg font-light transition-all duration-200 ${
                    isActivePath(item.path)
                      ? 'bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 text-[#fda085] border border-[#fda085]/30'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <span className="text-sm">{item.name}</span>
                  {item.path === '/messages' && unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
              
              <div className="border-t border-border/30 mt-4 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center px-3 py-3 space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                        <AvatarFallback className="bg-gradient-to-br from-[#f6d365] to-[#fda085] text-white text-sm font-medium">
                          {getDisplayInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-3 rounded-lg font-light text-foreground/70 hover:text-foreground hover:bg-muted/30 transition-all duration-200"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-3 rounded-lg font-light text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
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
                    className="block w-full text-left px-3 py-3 rounded-lg font-light bg-gradient-to-r from-[#f6d365] to-[#fda085] text-black hover:from-[#fda085] hover:to-[#f6d365] transition-all duration-200"
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