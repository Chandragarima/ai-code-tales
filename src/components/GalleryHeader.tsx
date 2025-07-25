
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, Sparkles } from "lucide-react";

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
    <div className="mb-8 sm:mb-12">
      {/* Hero Section - Aligned with homepage */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex flex-col items-center space-y-6 sm:space-y-8">
          <h1 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.75rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
            Gallery
          </h1>
          {/* Divider */}
          <div className="w-8 sm:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
          <p className="text-sm sm:text-base lg:text-lg text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px] px-4">
            Curated stories behind exceptional AI-built applications
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 lg:gap-6 items-center justify-between">
          {/* Search and Filter - Left Side */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full sm:w-56 pl-10 pr-4 h-10 sm:h-12 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 text-sm rounded-xl transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <Select value={selectedTool} onValueChange={onToolChange}>
              <SelectTrigger className="w-full sm:w-40 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 rounded-xl h-10 sm:h-12 text-sm transition-all duration-300">
                <Filter className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="All tools" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-sm border-white/20 rounded-xl">
                {availableTools.map((tool) => (
                  <SelectItem 
                    key={tool} 
                    value={tool}
                    className="hover:bg-[#f6d365]/10 focus:bg-[#f6d365]/10 rounded-lg"
                  >
                    {tool}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button - Right Side */}
          <Button 
            onClick={() => navigate('/submit')}
            className="bg-gradient-to-r from-white via-[#f6d365] to-[#fda085] hover:from-[#f6d365] hover:via-[#fda085] hover:to-white text-gray-900 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#fda085]/20 transition-all duration-300 group min-w-[120px] sm:min-w-[140px] md:min-w-[160px] rounded-xl hover:scale-105 w-full md:w-auto"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden xs:inline">Share Story</span>
            <span className="xs:hidden">Share</span>
          </Button>
        </div>

        {/* Active Filters - Only show when active */}
        {(searchQuery || selectedTool !== 'All') && (
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <span>Active filters:</span>
            <div className="flex gap-2">
              {searchQuery && (
                <div className="px-3 py-1 bg-[#f6d365]/20 text-[#f6d365] rounded-full text-xs border border-[#f6d365]/30">
                  "{searchQuery}"
                </div>
              )}
              {selectedTool !== 'All' && (
                <div className="px-3 py-1 bg-[#fda085]/20 text-[#fda085] rounded-full text-xs border border-[#fda085]/30">
                  {selectedTool}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
