
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter } from "lucide-react";

interface GalleryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTool: string;
  onToolChange: (tool: string) => void;
  availableTools: string[];
}

export const GalleryHeader = ({ 
  searchQuery, 
  onSearchChange, 
  selectedTool, 
  onToolChange, 
  availableTools 
}: GalleryHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      
      {/* Search and Filter Section */}
      <div className="flex gap-4 justify-center items-center mb-12 flex-wrap max-w-2xl mx-auto">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects, tools, or descriptions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50 focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTool} onValueChange={onToolChange}>
            <SelectTrigger className="w-[180px] bg-background/80 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="Filter by tool" />
            </SelectTrigger>
            <SelectContent>
              {availableTools.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {tool}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6 justify-center flex-wrap">
        <Button 
          onClick={() => navigate('/submit')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-light shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Share Your Story
        </Button>
        {user && (
          <Button 
            onClick={() => navigate('/my-projects')}
            variant="outline" 
            className="border-border hover:border-primary/50 hover:bg-primary/5 px-8 py-3 text-lg font-light backdrop-blur-sm"
          >
            My Projects
          </Button>
        )}
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
