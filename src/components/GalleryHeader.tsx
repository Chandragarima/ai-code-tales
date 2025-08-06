
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, ArrowLeft } from "lucide-react";

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
    <div className="mb-4 sm:mb-6 lg:mb-8">
      {/* Mobile Header Bar */}
      <div className="md:hidden mb-4">
        <div className="container mx-auto px-4">
          {/* <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-[#fda085] transition-colors duration-200 p-2 -ml-2"
              size="sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button> */}
            
            <h1 className="font-['Playfair_Display'] text-2xl font-normal text-center bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
              Gallery
            </h1>
            <div className="flex flex-col items-center mt-4 mb-8">
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
            {/* </div> */}
          </div>
          {/* </div> */}

          {/* Mobile Compact Search and Filter */}
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 text-sm rounded-lg transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <Select value={selectedTool} onValueChange={onToolChange}>
              <SelectTrigger className="w-32 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 rounded-lg h-10 text-sm transition-all duration-300">
                <Filter className="h-4 w-4 text-muted-foreground mr-1" />
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-sm border-white/20 rounded-lg">
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

          {/* Active Filters */}
          {(searchQuery || selectedTool !== 'All') && (
            <div className="flex items-center gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Active:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="px-2 py-1 bg-[#f6d365]/20 text-[#f6d365] rounded-full text-xs border border-[#f6d365]/30">
                    "{searchQuery}"
                  </div>
                )}
                {selectedTool !== 'All' && (
                  <div className="px-2 py-1 bg-[#fda085]/20 text-[#fda085] rounded-full text-xs border border-[#fda085]/30">
                    {selectedTool}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop Header */}
      <div className="hidden md:block text-center mb-6 lg:mb-8">
        <div className="flex flex-col items-center space-y-6 lg:space-y-8">
          <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
            Gallery
          </h1>
          {/* Divider */}
          <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
          {/* Subtitle */}
          <p className="text-sm lg:text-base text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
            Curated stories behind exceptional AI-built applications
          </p>
        </div>
      </div>

      {/* Desktop Compact Search and Filter Section */}
      <div className="hidden md:block container mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 h-10 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 text-sm rounded-lg transition-all duration-300"
            />
          </div>

          {/* Filter */}
          <Select value={selectedTool} onValueChange={onToolChange}>
            <SelectTrigger className="w-36 bg-card/60 backdrop-blur-sm border-white/10 focus:border-[#f6d365]/30 focus:ring-[#f6d365]/10 rounded-lg h-10 text-sm transition-all duration-300">
              <Filter className="h-4 w-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="All tools" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-white/20 rounded-lg">
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

        {/* Active Filters - Only show when active */}
        {(searchQuery || selectedTool !== 'All') && (
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
            <span className="whitespace-nowrap">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <div className="px-2 py-1 bg-[#f6d365]/20 text-[#f6d365] rounded-full text-xs border border-[#f6d365]/30">
                  "{searchQuery}"
                </div>
              )}
              {selectedTool !== 'All' && (
                <div className="px-2 py-1 bg-[#fda085]/20 text-[#fda085] rounded-full text-xs border border-[#fda085]/30">
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
