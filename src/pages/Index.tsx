
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 mb-8">
            <h1 className="text-8xl font-light px-8 py-6 bg-background/80 backdrop-blur-sm rounded-xl bg-elegant-gradient bg-clip-text text-transparent">
              AI Gallery
            </h1>
          </div>
          <p className="text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Discover extraordinary applications built with AI. Share your story, connect with creators, and explore the future of technology.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              onClick={() => navigate('/gallery')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-light shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Explore Gallery
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {user ? (
              <Button 
                onClick={() => navigate('/submit')}
                variant="outline" 
                className="border-border hover:border-primary/50 hover:bg-primary/5 px-8 py-4 text-lg font-light backdrop-blur-sm"
              >
                Share Your Project
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline" 
                className="border-border hover:border-primary/50 hover:bg-primary/5 px-8 py-4 text-lg font-light backdrop-blur-sm"
              >
                Join Community
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Stories</h3>
            <p className="text-foreground/70 font-light leading-relaxed">
              Discover the fascinating stories behind innovative AI applications and the creators who built them.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Connect & Collaborate</h3>
            <p className="text-foreground/70 font-light leading-relaxed">
              Network with fellow AI enthusiasts, share experiences, and find your next collaboration partner.
            </p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Showcase Excellence</h3>
            <p className="text-foreground/70 font-light leading-relaxed">
              Present your AI projects to a curated audience of creators, investors, and technology enthusiasts.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-12 border border-border/30">
          <h2 className="text-4xl font-light mb-6 bg-elegant-gradient bg-clip-text text-transparent">
            Ready to Share Your AI Story?
          </h2>
          <p className="text-xl text-foreground/80 mb-8 font-light">
            Join our community of innovators and showcase your AI-powered creations.
          </p>
          <Button 
            onClick={() => navigate(user ? '/submit' : '/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-light shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {user ? 'Submit Your Project' : 'Get Started Today'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
