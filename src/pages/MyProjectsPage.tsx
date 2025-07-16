
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { MyProjects } from "@/components/MyProjects";

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-subtle-grid bg-grid flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-elegant-accent mx-auto mb-4"></div>
          <p className="text-text-elegant">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background bg-subtle-grid bg-grid">
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 text-text-elegant hover:text-foreground font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
          
          <div className="text-center">
            <h1 className="text-5xl font-light mb-6 bg-elegant-gradient bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-text-elegant text-lg font-light leading-relaxed">
              Manage and track your submitted projects
            </p>
          </div>
        </div>

        <MyProjects />
      </div>
    </div>
  );
}
