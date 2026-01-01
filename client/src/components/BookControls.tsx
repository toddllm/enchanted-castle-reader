import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookControlsProps {
  currentPage: number;
  totalPages: number;
  onNext: () => void;
  onPrev: () => void;
  onBookmark: () => void;
  isBookmarked: boolean;
}

export function BookControls({ 
  currentPage, 
  totalPages, 
  onNext, 
  onPrev, 
  onBookmark,
  isBookmarked 
}: BookControlsProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-border/50">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onPrev} 
        disabled={currentPage === 1}
        aria-label="Previous page"
        data-testid="nav-prev"
        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <div className="flex items-center gap-2 px-2" data-testid="page-indicator">
        <span className="font-display text-lg font-bold text-primary min-w-[3ch] text-center" data-testid="page-current">
          {currentPage}
        </span>
        <span className="text-muted-foreground font-serif italic">/</span>
        <span className="text-muted-foreground font-serif italic min-w-[3ch] text-center" data-testid="page-total">
          {totalPages}
        </span>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onNext} 
        disabled={currentPage === totalPages}
        aria-label="Next page"
        data-testid="nav-next"
        className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="w-px h-8 bg-border mx-1" />

      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBookmark}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        data-testid="bookmark-toggle"
        className={cn(
          "rounded-full transition-all duration-300",
          isBookmarked 
            ? "text-accent hover:text-accent/80 bg-accent/10" 
            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
        )}
      >
        <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
      </Button>
    </div>
  );
}
