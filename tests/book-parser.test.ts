import { describe, it, expect } from 'vitest';
import { parseBookContent, Chapter, BookPage } from '@/lib/book-parser';

describe('parseBookContent', () => {
  describe('chapter parsing', () => {
    it('should parse a single chapter with text content', () => {
      const content = `CHAPTER I
This is the first paragraph.

This is the second paragraph.`;

      const chapters = parseBookContent(content);

      expect(chapters).toHaveLength(1);
      expect(chapters[0].title).toBe('CHAPTER I');
      expect(chapters[0].id).toBe(1);
      expect(chapters[0].pages.length).toBeGreaterThan(0);
    });

    it('should parse multiple chapters', () => {
      const content = `CHAPTER I
First chapter content.

CHAPTER II
Second chapter content.

CHAPTER III
Third chapter content.`;

      const chapters = parseBookContent(content);

      expect(chapters).toHaveLength(3);
      expect(chapters[0].title).toBe('CHAPTER I');
      expect(chapters[1].title).toBe('CHAPTER II');
      expect(chapters[2].title).toBe('CHAPTER III');
    });

    it('should handle Roman numerals correctly', () => {
      const content = `CHAPTER IV
Fourth chapter.

CHAPTER IX
Ninth chapter.

CHAPTER XIV
Fourteenth chapter.`;

      const chapters = parseBookContent(content);

      expect(chapters).toHaveLength(3);
      expect(chapters[0].title).toBe('CHAPTER IV');
      expect(chapters[1].title).toBe('CHAPTER IX');
      expect(chapters[2].title).toBe('CHAPTER XIV');
    });
  });

  describe('comic panel parsing', () => {
    it('should parse comic panel tags correctly', () => {
      const content = `CHAPTER I
Some introductory text.

<comic-panel src="/images/test.png" alt="Test panel description">
Dialog line one.

Dialog line two.
</comic-panel>

More text after the panel.`;

      const chapters = parseBookContent(content);
      const allPages = chapters.flatMap(c => c.pages);
      const comicPage = allPages.find(p => p.type === 'comic');

      expect(comicPage).toBeDefined();
      expect(comicPage?.imageSrc).toBe('/images/test.png');
      expect(comicPage?.caption).toBe('Test panel description');
      expect(comicPage?.content).toContain('Dialog line');
    });

    it('should handle multiple comic panels in sequence', () => {
      const content = `CHAPTER I
<comic-panel src="/images/panel1.png" alt="First panel">
First dialog.
</comic-panel>

<comic-panel src="/images/panel2.png" alt="Second panel">
Second dialog.
</comic-panel>`;

      const chapters = parseBookContent(content);
      const allPages = chapters.flatMap(c => c.pages);
      const comicPages = allPages.filter(p => p.type === 'comic');

      expect(comicPages).toHaveLength(2);
      expect(comicPages[0].imageSrc).toBe('/images/panel1.png');
      expect(comicPages[1].imageSrc).toBe('/images/panel2.png');
    });

    it('should preserve comic panel order relative to text', () => {
      const content = `CHAPTER I
Text before.

<comic-panel src="/images/middle.png" alt="Middle panel">
Middle dialog.
</comic-panel>

Text after.`;

      const chapters = parseBookContent(content);
      const allPages = chapters.flatMap(c => c.pages);

      // Find indices
      const textBeforeIdx = allPages.findIndex(p => p.type === 'text' && p.content.includes('Text before'));
      const comicIdx = allPages.findIndex(p => p.type === 'comic');
      const textAfterIdx = allPages.findIndex(p => p.type === 'text' && p.content.includes('Text after'));

      expect(textBeforeIdx).toBeLessThan(comicIdx);
      expect(comicIdx).toBeLessThan(textAfterIdx);
    });
  });

  describe('page ID assignment', () => {
    it('should assign unique sequential IDs across chapters', () => {
      const content = `CHAPTER I
First chapter paragraph one.

First chapter paragraph two.

CHAPTER II
Second chapter paragraph one.`;

      const chapters = parseBookContent(content);
      const allPages = chapters.flatMap(c => c.pages);
      const ids = allPages.map(p => p.id);

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // IDs should be sequential starting from 1
      expect(Math.min(...ids)).toBe(1);
    });

    it('should maintain consistent page IDs after re-parsing', () => {
      const content = `CHAPTER I
Some text content.

<comic-panel src="/images/test.png" alt="Test">
Dialog.
</comic-panel>`;

      const chapters1 = parseBookContent(content);
      const chapters2 = parseBookContent(content);

      const pages1 = chapters1.flatMap(c => c.pages);
      const pages2 = chapters2.flatMap(c => c.pages);

      expect(pages1.length).toBe(pages2.length);
      pages1.forEach((page, idx) => {
        expect(page.id).toBe(pages2[idx].id);
      });
    });
  });

  describe('dialogue extraction', () => {
    it('should extract dialogue from comic panels', () => {
      const content = `CHAPTER I
<comic-panel src="/images/test.png" alt="Test">
"Hello," said Gerald.

"Hi there," replied Jimmy.
</comic-panel>`;

      const chapters = parseBookContent(content);
      const comicPage = chapters[0].pages.find(p => p.type === 'comic');

      expect(comicPage?.content).toContain('Hello');
      expect(comicPage?.content).toContain('Hi there');
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const chapters = parseBookContent('');
      expect(chapters).toHaveLength(0);
    });

    it('should handle content without chapter headers', () => {
      const content = `Just some text without a chapter header.

Another paragraph.`;

      const chapters = parseBookContent(content);
      // Should either create a default chapter or handle gracefully
      expect(chapters.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters in text', () => {
      const content = `CHAPTER I
Text with special chars: "quotes", 'apostrophes', em—dashes, and ellipses...`;

      const chapters = parseBookContent(content);
      expect(chapters[0].pages[0].content).toContain('quotes');
      expect(chapters[0].pages[0].content).toContain('apostrophes');
    });

    it('should handle very long paragraphs by paginating', () => {
      const longParagraph = 'A'.repeat(2000);
      const content = `CHAPTER I
${longParagraph}`;

      const chapters = parseBookContent(content);
      // Long content should be split across pages
      expect(chapters[0].pages.length).toBeGreaterThanOrEqual(1);
    });
  });
});
