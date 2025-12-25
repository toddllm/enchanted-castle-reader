import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/book-parser';
import { cn } from '@/lib/utils';

interface ChapterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentChapterId: number;
  onSelectChapter: (pageId: number) => void;
}

export function ChapterMenu({ 
  isOpen, 
  onClose, 
  chapters, 
  currentChapterId, 
  onSelectChapter 
}: ChapterMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-[70] w-full max-w-sm bg-card border-r border-border shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-display text-2xl text-primary flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Chapters
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-background">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chapters.map((chapter) => {
                const isActive = chapter.id === currentChapterId;
                const firstPageId = chapter.pages[0]?.id || 1;
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      onSelectChapter(firstPageId);
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all duration-200 group relative overflow-hidden",
                      isActive 
                        ? "bg-primary/5 border-primary shadow-sm" 
                        : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div className="relative z-10">
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-widest mb-1 block",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/80"
                      )}>
                        Chapter {chapter.id}
                      </span>
                      <h3 className={cn(
                        "font-serif text-lg font-medium",
                        isActive ? "text-foreground" : "text-foreground/80"
                      )}>
                        {chapter.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-2 font-serif italic">
                        {chapter.pages.length} pages
                      </p>
                    </div>
                    
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground font-serif italic">
                The Enchanted Castle by E. Nesbit
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
