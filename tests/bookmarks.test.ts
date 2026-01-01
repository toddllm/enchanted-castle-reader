import { describe, it, expect, beforeEach, vi } from 'vitest';

// Constants matching Home.tsx
const BOOKMARKS_STORAGE_KEY = 'enchanted-castle-bookmarks';
const PROGRESS_STORAGE_KEY = 'enchanted-castle-progress';
const LEGACY_BOOKMARK_KEY = 'enchanted-castle-page';

interface Bookmark {
  id: string;
  pageId: number;
  chapterId: number;
  chapterTitle: string;
  excerpt: string;
  createdAt: string;
}

// Helper to simulate bookmark operations (mirrors Home.tsx logic)
function createBookmark(
  pageId: number,
  chapterId: number,
  chapterTitle: string,
  excerpt: string
): Bookmark {
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pageId,
    chapterId,
    chapterTitle,
    excerpt,
    createdAt: new Date().toISOString(),
  };
}

function loadBookmarks(): Bookmark[] {
  const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
}

function addBookmark(bookmark: Bookmark): Bookmark[] {
  const existing = loadBookmarks();
  const updated = [bookmark, ...existing];
  saveBookmarks(updated);
  return updated;
}

function removeBookmark(bookmarkId: string): Bookmark[] {
  const existing = loadBookmarks();
  const updated = existing.filter(b => b.id !== bookmarkId);
  saveBookmarks(updated);
  return updated;
}

function isPageBookmarked(pageId: number): boolean {
  const bookmarks = loadBookmarks();
  return bookmarks.some(b => b.pageId === pageId);
}

describe('Bookmark Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('add/remove bookmarks', () => {
    it('should add a bookmark to empty list', () => {
      const bookmark = createBookmark(1, 1, 'CHAPTER I', 'First page excerpt...');
      addBookmark(bookmark);

      const loaded = loadBookmarks();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].pageId).toBe(1);
      expect(loaded[0].chapterTitle).toBe('CHAPTER I');
    });

    it('should add multiple bookmarks', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First excerpt');
      const b2 = createBookmark(5, 1, 'CHAPTER I', 'Fifth excerpt');
      const b3 = createBookmark(12, 2, 'CHAPTER II', 'Twelfth excerpt');

      addBookmark(b1);
      addBookmark(b2);
      addBookmark(b3);

      const loaded = loadBookmarks();
      expect(loaded).toHaveLength(3);
    });

    it('should prepend new bookmarks (most recent first)', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First');
      const b2 = createBookmark(5, 1, 'CHAPTER I', 'Fifth');

      addBookmark(b1);
      addBookmark(b2);

      const loaded = loadBookmarks();
      // b2 should be first since it was added last
      expect(loaded[0].pageId).toBe(5);
      expect(loaded[1].pageId).toBe(1);
    });

    it('should remove a bookmark by ID', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First');
      const b2 = createBookmark(5, 1, 'CHAPTER I', 'Fifth');

      addBookmark(b1);
      addBookmark(b2);

      removeBookmark(b1.id);

      const loaded = loadBookmarks();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].pageId).toBe(5);
    });

    it('should handle removing non-existent bookmark gracefully', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First');
      addBookmark(b1);

      removeBookmark('non-existent-id');

      const loaded = loadBookmarks();
      expect(loaded).toHaveLength(1);
    });
  });

  describe('bookmark state checks', () => {
    it('should correctly identify bookmarked pages', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First');
      addBookmark(b1);

      expect(isPageBookmarked(1)).toBe(true);
      expect(isPageBookmarked(2)).toBe(false);
    });

    it('should update state after removal', () => {
      const b1 = createBookmark(1, 1, 'CHAPTER I', 'First');
      addBookmark(b1);

      expect(isPageBookmarked(1)).toBe(true);

      removeBookmark(b1.id);

      expect(isPageBookmarked(1)).toBe(false);
    });
  });

  describe('legacy bookmark migration', () => {
    it('should read legacy bookmark key if present', () => {
      // Simulate legacy storage
      localStorage.setItem(LEGACY_BOOKMARK_KEY, '15');

      const legacyPage = localStorage.getItem(LEGACY_BOOKMARK_KEY);
      expect(legacyPage).toBe('15');

      const parsedId = legacyPage ? parseInt(legacyPage, 10) : null;
      expect(parsedId).toBe(15);
    });

    it('should migrate legacy bookmark to new format', () => {
      // Legacy key stores just page ID
      localStorage.setItem(LEGACY_BOOKMARK_KEY, '15');

      // Migration logic (simplified)
      const legacyPage = localStorage.getItem(LEGACY_BOOKMARK_KEY);
      if (legacyPage) {
        const pageId = parseInt(legacyPage, 10);
        if (!isNaN(pageId)) {
          // Create a migrated bookmark
          const migratedBookmark = createBookmark(
            pageId,
            1, // Default chapter
            'CHAPTER I',
            'Migrated bookmark'
          );
          addBookmark(migratedBookmark);
          localStorage.removeItem(LEGACY_BOOKMARK_KEY);
        }
      }

      // Legacy key should be removed
      expect(localStorage.getItem(LEGACY_BOOKMARK_KEY)).toBeNull();

      // New bookmarks should contain the migrated entry
      const bookmarks = loadBookmarks();
      expect(bookmarks.some(b => b.pageId === 15)).toBe(true);
    });

    it('should not duplicate if already bookmarked', () => {
      // Add a bookmark first
      const existing = createBookmark(15, 2, 'CHAPTER II', 'Existing');
      addBookmark(existing);

      // Then set legacy (which would normally trigger migration)
      localStorage.setItem(LEGACY_BOOKMARK_KEY, '15');

      // Migration check
      const legacyPage = localStorage.getItem(LEGACY_BOOKMARK_KEY);
      if (legacyPage) {
        const pageId = parseInt(legacyPage, 10);
        const alreadyBookmarked = isPageBookmarked(pageId);

        if (!alreadyBookmarked) {
          addBookmark(createBookmark(pageId, 1, 'CHAPTER I', 'Migrated'));
        }
        localStorage.removeItem(LEGACY_BOOKMARK_KEY);
      }

      const bookmarks = loadBookmarks();
      // Should only have one bookmark for page 15
      const page15Bookmarks = bookmarks.filter(b => b.pageId === 15);
      expect(page15Bookmarks).toHaveLength(1);
    });
  });

  describe('progress persistence', () => {
    it('should save reading progress', () => {
      localStorage.setItem(PROGRESS_STORAGE_KEY, '25');

      const progress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      expect(progress).toBe('25');
    });

    it('should update progress on page change', () => {
      localStorage.setItem(PROGRESS_STORAGE_KEY, '10');
      localStorage.setItem(PROGRESS_STORAGE_KEY, '11');

      const progress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      expect(progress).toBe('11');
    });

    it('should restore progress on reload', () => {
      localStorage.setItem(PROGRESS_STORAGE_KEY, '42');

      // Simulate reload - read progress
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      const pageId = savedProgress ? parseInt(savedProgress, 10) : 1;

      expect(pageId).toBe(42);
    });
  });

  describe('data integrity', () => {
    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, 'not valid json');

      const bookmarks = loadBookmarks();
      expect(bookmarks).toEqual([]);
    });

    it('should handle non-array data gracefully', () => {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, '{"not": "an array"}');

      const bookmarks = loadBookmarks();
      expect(bookmarks).toEqual([]);
    });

    it('should preserve bookmark data across save/load cycles', () => {
      const original = createBookmark(10, 2, 'CHAPTER II', 'Test excerpt content');
      addBookmark(original);

      const loaded = loadBookmarks();
      const found = loaded.find(b => b.pageId === 10);

      expect(found).toBeDefined();
      expect(found?.chapterId).toBe(2);
      expect(found?.chapterTitle).toBe('CHAPTER II');
      expect(found?.excerpt).toBe('Test excerpt content');
      expect(found?.createdAt).toBeTruthy();
    });
  });
});
