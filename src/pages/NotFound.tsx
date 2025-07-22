import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl sm:text-7xl font-light bg-elegant-gradient bg-clip-text text-transparent">
              404
            </h1>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-light text-foreground mb-4">
            Page Not Found
          </h2>
          
          <p className="text-foreground/70 text-lg font-light leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
