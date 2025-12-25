import React, { useState, useEffect } from 'react';
import { BookLayout } from '@/components/BookLayout';
import { BookPage } from '@/components/BookPage';
import { ComicPage } from '@/components/ComicPage';
import { BookControls } from '@/components/BookControls';
import { ChapterMenu } from '@/components/ChapterMenu';
import { Menu } from 'lucide-react';
import { rawBookContent } from '@/lib/book-content';
import { parseBookContent, Chapter } from '@/lib/book-parser';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const parsedChapters = parseBookContent(rawBookContent);
    setChapters(parsedChapters);
    
    // Load saved progress
    const savedPage = localStorage.getItem('enchanted-castle-page');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
      setIsBookmarked(true);
    }
  }, []);

  const handleNext = () => {
    if (chapters.length === 0) return;
    const totalPages = chapters[0].pages.length;
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBookmark = () => {
    if (isBookmarked && localStorage.getItem('enchanted-castle-page') === currentPage.toString()) {
      // Remove bookmark
      localStorage.removeItem('enchanted-castle-page');
      setIsBookmarked(false);
    } else {
      // Set bookmark
      localStorage.setItem('enchanted-castle-page', currentPage.toString());
      setIsBookmarked(true);
    }
  };

  const handleStartReading = () => {
    setShowCover(false);
  };

  const handleChapterSelect = (pageId: number) => {
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (chapters.length === 0) return null;

  // Find current chapter based on current page
  const currentChapter = chapters.find(c => c.pages.some(p => p.id === currentPage)) || chapters[0];
  
  // Calculate total pages across all chapters for global progress
  const allPages = chapters.flatMap(c => c.pages);
  const totalPages = allPages.length;
  
  const activePage = allPages.find(p => p.id === currentPage);

  return (
    <BookLayout>
      <AnimatePresence mode="wait">
        {showCover ? (
          <motion.div 
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center min-h-[80vh] text-center"
          >
            <div className="relative w-full max-w-md aspect-[2/3] shadow-2xl mb-8 rounded-lg overflow-hidden group cursor-pointer" onClick={handleStartReading}>
              <img 
                src="/images/book-cover.png" 
                alt="The Enchanted Castle" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              
              <div className="absolute bottom-12 left-0 w-full flex justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl px-8 py-6 shadow-lg border-2 border-accent/50"
                >
                  Open Book
                </Button>
              </div>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">The Enchanted Castle</h1>
            <p className="font-serif text-xl text-muted-foreground italic">by E. Nesbit</p>
          </motion.div>
        ) : (
          <div key="reader" className="relative">
            {/* Hero Background for Reader Mode */}
            <div className="fixed top-0 left-0 w-full h-64 z-0 opacity-20 pointer-events-none mask-image-gradient">
              <img src="/images/hero-bg.png" alt="Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
            </div>

            {/* Menu Button */}
            <div className="fixed top-4 left-4 z-50">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="bg-card/80 backdrop-blur-sm shadow-md hover:bg-card rounded-full border border-border/50"
              >
                <Menu className="w-6 h-6 text-primary" />
              </Button>
            </div>

            <ChapterMenu 
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              chapters={chapters}
              currentChapterId={currentChapter.id}
              onSelectChapter={handleChapterSelect}
            />

            <div className="relative z-10 pt-8">
              {activePage && (
                activePage.type === 'comic' ? (
                  <ComicPage
                    imageSrc={activePage.imageSrc!}
                    caption={activePage.caption}
                    dialogue={activePage.dialogue}
                    isActive={true}
                  />
                ) : (
                  <BookPage 
                    page={activePage} 
                    isActive={true} 
                    pageNumber={currentPage} 
                    totalPages={totalPages} 
                  />
                )
              )}
            </div>

            <BookControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onNext={handleNext} 
              onPrev={handlePrev} 
              onBookmark={handleBookmark}
              isBookmarked={isBookmarked && localStorage.getItem('enchanted-castle-page') === currentPage.toString()}
            />
          </div>
        )}
      </AnimatePresence>
    </BookLayout>
  );
}
