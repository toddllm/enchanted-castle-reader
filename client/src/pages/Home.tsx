import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookLayout } from '@/components/BookLayout';
import { BookPage } from '@/components/BookPage';
import { ComicPage } from '@/components/ComicPage';
import { BookControls } from '@/components/BookControls';
import { ChapterMenu } from '@/components/ChapterMenu';
import { Menu } from 'lucide-react';
import { rawBookContent } from '@/lib/book-content';
import { parseBookContent, Chapter, BookPage as BookPageType } from '@/lib/book-parser';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { useLocation, useRoute } from 'wouter';
import illustrationsData from '@/data/illustrations.json';
import bookData from '@/data/book.json';

const BOOKMARKS_STORAGE_KEY = 'enchanted-castle-bookmarks';
const PROGRESS_STORAGE_KEY = 'enchanted-castle-progress';
const LEGACY_BOOKMARK_KEY = 'enchanted-castle-page';
const EXCERPT_MAX_LENGTH = 140;

type Bookmark = {
  id: string;
  pageId: number;
  chapterId: number;
  chapterTitle: string;
  excerpt: string;
  createdAt: string;
};

type IllustrationScene = {
  id: string;
  description: string;
  placement?: string;
  path: string;
  originalFile?: string;
};

type IllustrationChapter = {
  chapterId: number;
  title: string;
  scenes: IllustrationScene[];
};

type IllustrationsData = {
  chapters: IllustrationChapter[];
};

const getExcerpt = (page: BookPageType) => {
  if (page.type === 'comic') {
    if (page.dialogue && page.dialogue.length > 0) {
      const dialogueText = page.dialogue.join(' ').replace(/\s+/g, ' ').trim();
      if (dialogueText.length <= EXCERPT_MAX_LENGTH) {
        return dialogueText;
      }
      return `${dialogueText.slice(0, EXCERPT_MAX_LENGTH).trim()}…`;
    }
    return page.caption || page.content || 'Comic panel';
  }
  const flattened = page.content.replace(/\s+/g, ' ').trim();
  if (flattened.length <= EXCERPT_MAX_LENGTH) {
    return flattened;
  }
  return `${flattened.slice(0, EXCERPT_MAX_LENGTH).trim()}…`;
};

const createBookmark = (page: BookPageType, chapter: Chapter): Bookmark => ({
  id: nanoid(),
  pageId: page.id,
  chapterId: chapter.id,
  chapterTitle: chapter.title,
  excerpt: getExcerpt(page),
  createdAt: new Date().toISOString()
});

const buildIllustrationLookup = (data?: IllustrationsData) => {
  const sceneById = new Map<string, IllustrationScene>();
  const sceneByPath = new Map<string, IllustrationScene>();
  const scenesByChapter = new Map<number, IllustrationScene[]>();

  if (!data?.chapters) {
    return { sceneById, sceneByPath, scenesByChapter };
  }

  data.chapters.forEach(chapter => {
    scenesByChapter.set(chapter.chapterId, chapter.scenes);
    chapter.scenes.forEach(scene => {
      sceneById.set(scene.id, scene);
      sceneByPath.set(scene.path, scene);
    });
  });

  return { sceneById, sceneByPath, scenesByChapter };
};

const applyIllustrationMetadata = (
  chapters: Chapter[],
  lookup: ReturnType<typeof buildIllustrationLookup>
) =>
  chapters.map(chapter => ({
    ...chapter,
    pages: chapter.pages.map(page => {
      if (page.type !== 'comic') return page;
      const scene =
        (page.illustrationId ? lookup.sceneById.get(page.illustrationId) : undefined) ||
        (page.imageSrc ? lookup.sceneByPath.get(page.imageSrc) : undefined);
      if (!scene) return page;
      return {
        ...page,
        illustrationId: page.illustrationId || scene.id,
        caption: page.caption || scene.description,
        imageSrc: scene.path
      };
    })
  }));

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentPageId, setCurrentPageId] = useState(1);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [showCover, setShowCover] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasHydratedBookmarks = useRef(false);
  const [location, setLocation] = useLocation();
  const [matchPage, pageParams] = useRoute('/page/:pageId');
  const [matchChapter, chapterParams] = useRoute('/chapter/:chapterId');

  const illustrationLookup = useMemo(
    () => buildIllustrationLookup(illustrationsData as IllustrationsData),
    []
  );

  useEffect(() => {
    const loadedChapters =
      (bookData as { chapters?: Chapter[] }).chapters?.filter(Boolean) ?? [];
    const parsedChapters =
      loadedChapters.length > 0 ? loadedChapters : parseBookContent(rawBookContent);
    const enrichedChapters = applyIllustrationMetadata(parsedChapters, illustrationLookup);
    setChapters(enrichedChapters);

    let savedBookmarks: Bookmark[] = [];
    const storedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (storedBookmarks) {
      try {
        const parsed = JSON.parse(storedBookmarks) as Bookmark[];
        if (Array.isArray(parsed)) {
          savedBookmarks = parsed;
        }
      } catch {
        savedBookmarks = [];
      }
    }

    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    const legacyPage = localStorage.getItem(LEGACY_BOOKMARK_KEY);
    const initialPageId = savedProgress || legacyPage;
    if (initialPageId) {
      const parsedId = parseInt(initialPageId, 10);
      if (!Number.isNaN(parsedId)) {
        setCurrentPageId(parsedId);
      }
    }

    if (legacyPage) {
      const legacyId = parseInt(legacyPage, 10);
      const legacyPageData = parsedChapters.flatMap(chapter => chapter.pages).find(page => page.id === legacyId);
      if (legacyPageData) {
        const legacyChapter = parsedChapters.find(chapter => chapter.pages.some(page => page.id === legacyId)) || parsedChapters[0];
        const alreadyBookmarked = savedBookmarks.some(bookmark => bookmark.pageId === legacyId);
        if (!alreadyBookmarked) {
          savedBookmarks = [createBookmark(legacyPageData, legacyChapter), ...savedBookmarks];
        }
      }
      localStorage.removeItem(LEGACY_BOOKMARK_KEY);
    }

    setBookmarks(savedBookmarks);
  }, [illustrationLookup]);

  const allPages = useMemo(() => chapters.flatMap(chapter => chapter.pages), [chapters]);
  const totalPages = allPages.length;
  const currentPageIndex = allPages.findIndex(page => page.id === currentPageId);
  const safePageIndex = currentPageIndex === -1 ? 0 : currentPageIndex;
  const currentPageNumber = safePageIndex + 1;
  const activePage = allPages[safePageIndex];

  const currentChapter = chapters.find(chapter => chapter.pages.some(page => page.id === currentPageId)) || chapters[0];
  const isBookmarked = bookmarks.some(bookmark => bookmark.pageId === currentPageId);

  useEffect(() => {
    if (!chapters.length) return;
    if (!activePage) return;
    localStorage.setItem(PROGRESS_STORAGE_KEY, activePage.id.toString());
  }, [chapters.length, activePage]);

  useEffect(() => {
    if (!hasHydratedBookmarks.current) {
      hasHydratedBookmarks.current = true;
      return;
    }
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (!chapters.length) return;
    if (currentPageIndex === -1 && allPages.length > 0) {
      setCurrentPageId(allPages[0].id);
    }
  }, [chapters.length, currentPageIndex, allPages]);

  useEffect(() => {
    if (!chapters.length) return;
    if (matchPage && pageParams?.pageId) {
      const parsedId = parseInt(pageParams.pageId, 10);
      if (!Number.isNaN(parsedId)) {
        const target = allPages.find(page => page.id === parsedId);
        if (target) {
          setCurrentPageId(parsedId);
          setShowCover(false);
        }
      }
      return;
    }
    if (matchChapter && chapterParams?.chapterId) {
      const parsedId = parseInt(chapterParams.chapterId, 10);
      const chapter = chapters.find(item => item.id === parsedId);
      if (chapter?.pages[0]) {
        setCurrentPageId(chapter.pages[0].id);
        setShowCover(false);
      }
    }
  }, [
    chapters,
    allPages,
    matchPage,
    pageParams?.pageId,
    matchChapter,
    chapterParams?.chapterId
  ]);

  const handleNext = useCallback(() => {
    if (!activePage || safePageIndex >= totalPages - 1) return;
    const nextPage = allPages[safePageIndex + 1];
    setCurrentPageId(nextPage.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, allPages, safePageIndex, totalPages]);

  const handlePrev = useCallback(() => {
    if (!activePage || safePageIndex <= 0) return;
    const prevPage = allPages[safePageIndex - 1];
    setCurrentPageId(prevPage.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage, allPages, safePageIndex]);

  const handleBookmark = useCallback(() => {
    if (!activePage || !currentChapter) return;
    setBookmarks(prev => {
      const existing = prev.find(bookmark => bookmark.pageId === activePage.id);
      if (existing) {
        return prev.filter(bookmark => bookmark.id !== existing.id);
      }
      return [createBookmark(activePage, currentChapter), ...prev];
    });
  }, [activePage, currentChapter]);

  useEffect(() => {
    if (showCover) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isMenuOpen) return;
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
          return;
        }
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isMenuOpen, showCover]);

  useEffect(() => {
    if (showCover || !activePage) return;
    const target = `/page/${activePage.id}`;
    if (location !== target) {
      setLocation(target, { replace: true });
    }
  }, [activePage, location, setLocation, showCover]);

  const handleStartReading = () => {
    if (allPages.length > 0) {
      setCurrentPageId(allPages[0].id);
    }
    setShowCover(false);
    if (allPages.length > 0) {
      setLocation(`/page/${allPages[0].id}`, { replace: true });
    }
  };

  const handleContinueReading = () => {
    if (!activePage) return;
    setShowCover(false);
    setLocation(`/page/${activePage.id}`, { replace: true });
  };

  const handleChapterSelect = (pageId: number) => {
    setCurrentPageId(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmarkSelect = (pageId: number) => {
    setCurrentPageId(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmarkRemove = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
  };

  const handleTitlePage = () => {
    setShowCover(true);
    setIsMenuOpen(false);
    setLocation('/', { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (chapters.length === 0) return null;

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
            data-testid="cover-view"
          >
            <div className="relative w-full max-w-md aspect-[2/3] shadow-2xl mb-8 rounded-lg overflow-hidden group cursor-pointer" onClick={handleStartReading}>
              <img 
                src="/images/book-cover.png" 
                alt="The Enchanted Castle" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
              
              <div className="absolute bottom-10 left-0 w-full flex flex-col items-center gap-3 px-6">
                {currentPageId !== allPages[0]?.id && (
                  <Button
                    size="lg"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleContinueReading();
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-display text-xl px-8 py-6 shadow-lg border-2 border-accent/50"
                    data-testid="continue-reading"
                  >
                    Continue Reading
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleStartReading();
                  }}
                  className="font-display text-lg px-8 py-5 shadow-lg border-2 border-primary/50 bg-card/90 text-primary hover:bg-card hover:text-primary"
                  data-testid="start-reading"
                >
                  Start from Beginning
                </Button>
              </div>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl text-primary mb-4">The Enchanted Castle</h1>
            <p className="font-serif text-xl text-muted-foreground italic">by E. Nesbit</p>
          </motion.div>
        ) : (
          <div key="reader" className="relative" data-testid="reader-view">
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
                aria-label="Open library"
                data-testid="open-library"
                className="bg-card/80 backdrop-blur-sm shadow-md hover:bg-card rounded-full border border-border/50"
              >
                <Menu className="w-6 h-6 text-primary" />
              </Button>
            </div>

            <ChapterMenu 
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              onTitlePage={handleTitlePage}
              chapters={chapters}
              currentChapterId={currentChapter.id}
              currentPageId={currentPageId}
              bookmarks={bookmarks}
              onSelectChapter={handleChapterSelect}
              onSelectBookmark={handleBookmarkSelect}
              onRemoveBookmark={handleBookmarkRemove}
            />

            <div className="relative z-10 pt-8">
              <div className="w-full h-[70vh] md:h-[74vh] lg:h-[78vh]">
                {activePage && (
                  activePage.type === 'comic' ? (
                    <ComicPage
                      imageSrc={activePage.imageSrc ?? ''}
                      caption={activePage.caption}
                      dialogue={activePage.dialogue}
                      isActive={true}
                    />
                  ) : (
                    <BookPage 
                      page={activePage} 
                      isActive={true} 
                      pageNumber={currentPageNumber} 
                      totalPages={totalPages} 
                    />
                  )
                )}
              </div>
            </div>

            <BookControls 
              currentPage={currentPageNumber} 
              totalPages={totalPages} 
              onNext={handleNext} 
              onPrev={handlePrev} 
              onBookmark={handleBookmark}
              isBookmarked={isBookmarked}
            />
          </div>
        )}
      </AnimatePresence>
    </BookLayout>
  );
}
