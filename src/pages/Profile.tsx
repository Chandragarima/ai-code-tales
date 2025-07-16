import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Construction } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background bg-subtle-grid bg-grid">
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 text-text-elegant hover:text-foreground font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-5xl font-light mb-6 bg-elegant-gradient bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-text-elegant text-lg font-light leading-relaxed">
              Manage your account settings
            </p>
          </div>
        </div>

        <Card className="border-subtle-border bg-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground font-light text-xl">
              <User className="h-6 w-6 text-elegant-accent" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-medium">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-medium">{user.email}</h3>
                <p className="text-sm text-foreground/70">Joined on {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-6 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <Construction className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Profile Customization Coming Soon</h3>
              </div>
              <p className="text-foreground/70 leading-relaxed">
                We're working on enhanced profile features including:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-1 text-foreground/70">
                <li>Custom profile pictures</li>
                <li>Bio and social links</li>
                <li>Username customization</li>
                <li>Project portfolio display</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/my-projects')}
                className="flex-1 bg-primary hover:bg-primary/90 font-light"
              >
                View My Projects
              </Button>
              <Button 
                onClick={() => navigate('/submit')}
                variant="outline"
                className="flex-1 border-border hover:border-primary/30 font-light"
              >
                Submit New Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}