import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Users, Heart } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bg-tech-grid bg-grid">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge className="mb-6 bg-artistic-gradient text-primary-foreground px-4 py-2 text-sm">
            Where AI meets artistry
          </Badge>
          
          <h1 className="text-7xl font-bold mb-8 bg-artistic-gradient bg-clip-text text-transparent leading-tight">
            Bespoke Gallery
          </h1>
          
          <p className="text-2xl text-muted-foreground mb-4 leading-relaxed">
            A curated collection of AI-built applications where 
            <span className="text-accent font-medium"> every project has a story</span>
          </p>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Beyond features and functionality—discover the human journey behind each creation. 
            From midnight inspiration to deployed reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/gallery')}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg animate-tech-glow"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Stories
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/submit')}
              className="border-gallery-border hover:border-tech-glow/50 px-8 py-4 text-lg"
            >
              Share Your Journey
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center group">
            <div className="w-16 h-16 bg-artistic-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Story-Driven</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every project includes the creator's journey—the why, the challenges, the breakthroughs that made it special.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-tech-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Powered</h3>
            <p className="text-muted-foreground leading-relaxed">
              Discover how creators leverage Claude, GPT, Midjourney, and other AI tools to bring their visions to life.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Creator Connections</h3>
            <p className="text-muted-foreground leading-relaxed">
              Connect with builders who share their contact preferences. Collaborate, learn, or explore opportunities together.
            </p>
          </div>
        </div>

        {/* Stats/Metrics */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-tech-glow mb-2">120+</div>
              <div className="text-muted-foreground">Curated Projects</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-muted-foreground">AI Tools Featured</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
