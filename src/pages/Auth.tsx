
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthForm = z.infer<typeof authSchema>;

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();

  const form = useForm<AuthForm>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: AuthForm) => {
    setLoading(true);
    
    try {
      let result;
      if (isSignUp) {
        result = await signUp(data.email, data.password);
        if (!result.error) {
          toast({
            title: 'Account created successfully! 🎉',
            description: 'Please check your email to verify your account.',
          });
        }
      } else {
        result = await signIn(data.email, data.password);
        if (!result.error) {
          toast({
            title: 'Welcome back! 👋',
            description: 'You have been signed in successfully.',
          });
          // Don't navigate here, let the useEffect handle it
        }
      }

      if (result.error) {
        let errorMessage = 'An error occurred. Please try again.';
        
        if (result.error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (result.error.message?.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (result.error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link.';
        }
        
        toast({
          title: 'Authentication Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#f6d365]/5 to-[#fda085]/5 rounded-full blur-3xl pointer-events-none"></div>
       */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-5xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          {/* Mobile Header Bar */}
          <div className="md:hidden mb-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-muted-foreground hover:text-[#fda085] transition-colors duration-200 p-2 -ml-2"
                  size="sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <h1 className="font-['Playfair_Display'] text-2xl font-normal bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block text-center">
            <div className="flex flex-col items-center space-y-6 lg:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              {/* Divider */}
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              {/* Subtitle */}
              <p className="text-sm lg:text-base text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
                {isSignUp 
                  ? 'Join our community of AI creators and share your innovative projects'
                  : 'Sign in to your account and continue your journey'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex justify-center">
          <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 bg-card/90 backdrop-blur-sm max-w-md w-full">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardContent className="relative p-6 sm:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-light flex items-center gap-2 text-sm sm:text-base text-foreground/90">
                    <Mail className="h-4 w-4 text-[#fda085]" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...form.register('email')}
                    className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-light flex items-center gap-2 text-sm sm:text-base text-foreground/90">
                    <Lock className="h-4 w-4 text-[#fda085]" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...form.register('password')}
                    className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-black font-medium shadow-lg hover:shadow-xl transition-all duration-200 group py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      {isSignUp ? 'Create Account' : 'Sign In'}
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#fda085] hover:text-[#f6d365] font-light text-sm transition-all duration-200 hover:underline"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
