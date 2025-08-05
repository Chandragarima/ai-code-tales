
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Trophy, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      {/* Subtle Spotlight Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[900px] h-[700px] rounded-full blur-3xl animate-spotlight"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)'
          }}
        ></div>
        <div 
          className="absolute w-[600px] h-[400px] rounded-full blur-2xl animate-spotlight"
          style={{
            background: 'radial-gradient(circle, hsl(var(--elegant-accent) / 0.04) 0%, hsl(var(--elegant-accent) / 0.02) 50%, transparent 100%)',
            animationDelay: '2s'
          }}
        ></div>
      </div>
      
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mt-6 sm:mt-8 lg:mt-12 xl:mt-20 py-4 text-center">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <h1 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.75rem] font-bold leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
            Every AI build has a story.
            </h1>
            {/* Divider */}
            <div className="w-8 sm:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
            <p className="text-sm sm:text-base lg:text-lg text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
            Join a community that celebrates not just what was built, but who built it and why. Share your story, discover others, and connect with fellow AI builders.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center flex-wrap mt-12 sm:mt-16 lg:mt-20">
            <Button 
              onClick={() => navigate('/gallery')}
              className="bg-gradient-to-r from-white via-[#f6d365] to-[#fda085] hover:from-[#f6d365] hover:via-[#fda085] hover:to-white text-gray-900 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#fda085]/20 transition-all duration-300 group min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] rounded-xl hover:scale-105"
            >
              Explore Gallery
            </Button>
            {user ? (
              <Button 
                onClick={() => navigate('/submit')}
                variant="outline" 
                className="border-2 border-white/20 hover:border-[#f6d365]/40 hover:bg-white/5 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-medium backdrop-blur-sm min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] rounded-xl transition-all duration-300 hover:scale-105"
              >
                Share Story
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline" 
                className="border-2 border-white/20 hover:border-[#f6d365]/40 hover:bg-white/5 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-medium backdrop-blur-sm min-w-[160px] sm:min-w-[180px] lg:min-w-[200px] rounded-xl transition-all duration-300 hover:scale-105"
              >
                Join Community
              </Button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mt-12 sm:mt-16 lg:mt-20">
          {/* 1. Behind-the-Code Stories */}
          <div className="group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-card/80 backdrop-blur-[20px] border border-white/10 p-6 sm:p-8 lg:p-12 transition-all duration-300 hover:-translate-y-[10px] hover:border-white/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] rounded-[12px] sm:rounded-[16px] flex items-center justify-center mx-auto shadow-lg group-hover:shadow-[#fda085]/30 transition-all duration-300">
                  <Book className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
              <h3 className="font-['Crimson_Text'] text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4 text-foreground flex items-center justify-center ">
                The Real Build Stories
              </h3>
              <p className="text-foreground/70 font-light leading-[1.6] text-sm sm:text-base">
              Go beyond features. Discover the "why" behind each app and hear directly from creators about what inspired them and how they built it.
              </p>
            </div>
          </div>
          {/* 2. Connect & Collaborate */}
          <div className="group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-card/80 backdrop-blur-[20px] border border-white/10 p-6 sm:p-8 lg:p-12 transition-all duration-300 hover:-translate-y-[10px] hover:border-white/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-[12px] sm:rounded-[16px] flex items-center justify-center mx-auto shadow-lg group-hover:shadow-gray-500/30 transition-all duration-300">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-['Crimson_Text'] text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4 text-foreground flex items-center justify-center ">
                Meet the Builders
              </h3>
              <p className="text-foreground/70 font-light leading-[1.6] text-sm sm:text-base">
                Found an app you love? Connect directly with the creator. Ask questions, share feedback, or explore collaboration opportunities with fellow AI builders.
              </p>
            </div>
          </div>
          {/* 3. Curated Excellence */}
          <div className="group relative overflow-hidden rounded-[20px] sm:rounded-[24px] bg-card/80 backdrop-blur-[20px] border border-white/10 p-6 sm:p-8 lg:p-12 transition-all duration-300 hover:-translate-y-[10px] hover:border-white/20 hover:shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/5 via-transparent to-[#fda085]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="relative mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-[#fda085] via-[#f6d365] to-[#fda085] rounded-[12px] sm:rounded-[16px] flex items-center justify-center mx-auto shadow-lg group-hover:shadow-[#f6d365]/30 transition-all duration-300">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h3 className="font-['Crimson_Text'] text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4 text-foreground flex items-center justify-center ">
                Quality Over Quantity
              </h3>
              <p className="text-foreground/70 font-light leading-[1.6] text-sm sm:text-base ">
                Every featured app is handpicked for its story and innovation. No endless scrolling – just meaningful discoveries that inspire your next AI project.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative mt-20 sm:mt-24 lg:mt-28 mb-8 sm:mb-12 text-center max-w-[1200px] mx-auto">
          {/* Background effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-50 h-50 bg-gradient-to-br from-[#f6d365] to-transparent rounded-full opacity-[0.02] blur-[60px]"></div>
          
          <div className="relative z-10">
            <h2 className="font-['Crimson_Text'] text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-6 sm:mb-8 text-foreground tracking-[-0.01em] relative px-4">
              Your Build Deserves the Spotlight.
              {/* Divider */}
              <div className="absolute bottom-[-12px] sm:bottom-[-15px] left-1/2 transform -translate-x-1/2 w-10 sm:w-12 h-px bg-gradient-to-r from-[#f6d365] to-[#fda085]"></div>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-foreground/70 mb-8 sm:mb-10 max-w-[650px] mx-auto font-light leading-[1.8] px-4">
              Whether it's your first app or your fifteenth, every journey matters. Join our community and inspire fellow AI builders.
            </p>
            
            <div className="flex gap-4 p-4 justify-center flex-wrap">
              <Button 
                onClick={() => navigate('/submit')}
                className="group/btn relative overflow-hidden bg-gradient-to-r from-white via-[#f6d365] to-[#fda085] hover:from-[#f6d365] hover:via-[#fda085] hover:to-white text-gray-900 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-[#fda085]/20 transition-all duration-300 scale-105 transform"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  Share Story
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#fda085]/30 to-[#f6d365]/30 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

