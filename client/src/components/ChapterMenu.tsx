import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/book-parser';
import { cn } from '@/lib/utils';

type BookmarkItem = {
  id: string;
  pageId: number;
  chapterId: number;
  chapterTitle: string;
  excerpt: string;
  createdAt: string;
};

interface ChapterMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTitlePage: () => void;
  chapters: Chapter[];
  currentChapterId: number;
  currentPageId: number;
  bookmarks: BookmarkItem[];
  onSelectChapter: (pageId: number) => void;
  onSelectBookmark: (pageId: number) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
}

export function ChapterMenu({ 
  isOpen, 
  onClose, 
  onTitlePage,
  chapters, 
  currentChapterId, 
  currentPageId,
  bookmarks,
  onSelectChapter,
  onSelectBookmark,
  onRemoveBookmark
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
            data-testid="chapter-menu"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-display text-2xl text-primary flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Library
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-background">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Bookmark className="w-4 h-4" />
                  Bookmarks
                </div>
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-serif italic">
                    No bookmarks yet.
                  </p>
                ) : (
                  <div className="space-y-3" data-testid="bookmark-list">
                    {bookmarks.map((bookmark) => {
                      const isActive = bookmark.pageId === currentPageId;
                      return (
                        <div
                          key={bookmark.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                            isActive
                              ? "bg-primary/5 border-primary shadow-sm"
                              : "bg-background border-border hover:border-primary/50 hover:bg-muted/50"
                          )}
                        >
                          <button
                            onClick={() => {
                              onSelectBookmark(bookmark.pageId);
                              onClose();
                            }}
                            className="flex-1 text-left"
                            data-testid="bookmark-item"
                          >
                            <span className={cn(
                              "text-[11px] font-bold uppercase tracking-widest mb-1 block",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )}>
                              {bookmark.chapterTitle}
                            </span>
                            <p className="font-serif text-sm text-foreground/90 leading-snug">
                              {bookmark.excerpt}
                            </p>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => {
                              event.stopPropagation();
                              onRemoveBookmark(bookmark.id);
                            }}
                            className="rounded-full text-muted-foreground hover:text-primary hover:bg-muted"
                            aria-label="Remove bookmark"
                            data-testid="bookmark-remove"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  Chapters
                </div>
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
                      data-testid="chapter-item"
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
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onTitlePage();
                  onClose();
                }}
                className="w-full mb-4 font-serif text-sm"
                data-testid="title-page"
              >
                Return to Title Page
              </Button>
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
