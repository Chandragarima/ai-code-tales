
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const GalleryHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-20">
      <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 mb-8">
        <h1 className="text-7xl font-light px-8 py-4 bg-background/80 backdrop-blur-sm rounded-xl bg-elegant-gradient bg-clip-text text-transparent">
          Gallery
        </h1>
      </div>
      <p className="text-xl text-foreground/80 mb-12 max-w-2xl mx-auto font-light">
        Curated stories behind exceptional AI-built applications
      </p>
      <div className="flex gap-6 justify-center">
        <Button 
          onClick={() => navigate('/submit')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-light shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Share Your Story
        </Button>
        <Button 
          variant="outline" 
          className="border-border hover:border-primary/50 hover:bg-primary/5 px-8 py-3 text-lg font-light backdrop-blur-sm"
        >
          Discover More
        </Button>
      </div>
    </div>
  );
};
