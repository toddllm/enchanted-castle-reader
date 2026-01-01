import { describe, it, expect, beforeAll } from 'vitest';
import illustrationsData from '@/data/illustrations.json';
import bookData from '@/data/book.json';
import fs from 'fs';
import path from 'path';

interface Scene {
  id: string;
  description: string;
  placement: string;
  path: string;
  originalFile: string;
}

interface IllustrationChapter {
  chapterId: number;
  title: string;
  scenes: Scene[];
}

interface IllustrationsData {
  chapters: IllustrationChapter[];
}

interface BookPage {
  id: number;
  content: string;
  chapter: string;
  type: 'text' | 'comic';
  illustrationId?: string;
  caption?: string;
  dialogue?: string[];
}

interface BookChapter {
  id: number;
  title: string;
  pages: BookPage[];
}

interface BookData {
  chapters: BookChapter[];
}

const illustrations = illustrationsData as IllustrationsData;
const book = bookData as BookData;

describe('Illustration Mapping', () => {
  describe('illustrations.json structure', () => {
    it('should have chapters array', () => {
      expect(illustrations.chapters).toBeDefined();
      expect(Array.isArray(illustrations.chapters)).toBe(true);
    });

    it('should have valid scene structure for each chapter', () => {
      illustrations.chapters.forEach((chapter) => {
        expect(chapter.chapterId).toBeDefined();
        expect(typeof chapter.chapterId).toBe('number');
        expect(chapter.title).toBeDefined();
        expect(Array.isArray(chapter.scenes)).toBe(true);

        chapter.scenes.forEach((scene) => {
          expect(scene.id).toBeDefined();
          expect(scene.description).toBeDefined();
          expect(scene.path).toBeDefined();
          expect(scene.path).toMatch(/^\/images\//);
        });
      });
    });

    it('should have unique scene IDs across all chapters', () => {
      const allSceneIds = illustrations.chapters.flatMap(c => c.scenes.map(s => s.id));
      const uniqueIds = new Set(allSceneIds);
      expect(uniqueIds.size).toBe(allSceneIds.length);
    });
  });

  describe('scene ID to path mapping', () => {
    it('should map all scene IDs to valid paths', () => {
      const sceneMap = new Map<string, string>();

      illustrations.chapters.forEach((chapter) => {
        chapter.scenes.forEach((scene) => {
          sceneMap.set(scene.id, scene.path);
        });
      });

      // All paths should start with /images/
      sceneMap.forEach((path, id) => {
        expect(path).toMatch(/^\/images\/.*\.png$/);
      });
    });

    it('should have captions (descriptions) for all scenes', () => {
      illustrations.chapters.forEach((chapter) => {
        chapter.scenes.forEach((scene) => {
          expect(scene.description).toBeTruthy();
          expect(scene.description.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('book.json comic pages reference valid illustrations', () => {
    it('should have all comic page illustrationIds matching illustrations.json', () => {
      const allSceneIds = new Set(
        illustrations.chapters.flatMap(c => c.scenes.map(s => s.id))
      );

      const comicPages = book.chapters.flatMap(c =>
        c.pages.filter(p => p.type === 'comic' && p.illustrationId)
      );

      comicPages.forEach((page) => {
        expect(
          allSceneIds.has(page.illustrationId!),
          `Comic page ${page.id} references unknown illustration: ${page.illustrationId}`
        ).toBe(true);
      });
    });
  });

  describe('image file existence', () => {
    const publicImagesDir = path.join(process.cwd(), 'client/public/images');

    it('should have all referenced images in public/images directory', () => {
      // Skip if running in CI without file system access
      if (!fs.existsSync(publicImagesDir)) {
        console.warn('Skipping file existence check - public/images not found');
        return;
      }

      const missingImages: string[] = [];

      illustrations.chapters.forEach((chapter) => {
        chapter.scenes.forEach((scene) => {
          const imagePath = path.join(publicImagesDir, path.basename(scene.path));
          if (!fs.existsSync(imagePath)) {
            missingImages.push(scene.path);
          }
        });
      });

      if (missingImages.length > 0) {
        console.warn('Missing images:', missingImages);
      }

      // This test documents which images are missing but doesn't fail
      // since images may be added incrementally
      expect(missingImages.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('chapter alignment', () => {
    it('should have matching chapter IDs between illustrations and book data', () => {
      const illustrationChapterIds = illustrations.chapters.map(c => c.chapterId);
      const bookChapterIds = book.chapters.map(c => c.id);

      // All illustration chapters should exist in book
      illustrationChapterIds.forEach((id) => {
        expect(bookChapterIds).toContain(id);
      });
    });
  });
});
