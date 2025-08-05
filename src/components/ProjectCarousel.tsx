
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProjectCarouselProps {
  screenshots: string[];
  projectName: string;
}

export const ProjectCarousel = ({ screenshots, projectName }: ProjectCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <div className="relative group">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={openFullscreen}>
          <img
            src={screenshots[currentIndex]}
            alt={`${projectName} screenshot ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {screenshots.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeFullscreen}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="relative max-w-6xl max-h-full flex items-center">
            {screenshots.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            <img
              src={screenshots[currentIndex]}
              alt={`${projectName} screenshot ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {screenshots.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {screenshots.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
