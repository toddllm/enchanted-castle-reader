export interface BookPage {
  id: number;
  content: string;
  chapter: string;
  type: 'text' | 'comic';
  imageSrc?: string;
  caption?: string;
  dialogue?: string[];
}

export interface Chapter {
  id: number;
  title: string;
  pages: BookPage[];
}

const CHARS_PER_PAGE = 800;

export function parseBookContent(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  
  // Clean up the text
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  
  // Split content by comic-panel tags to handle them separately
  // This regex captures the content before, the attributes, the inner content, and the content after
  const parts = cleanText.split(/(<comic-panel[^>]*>[\s\S]*?<\/comic-panel>)/g);
  
  let pageIndex = 1;
  const pages: BookPage[] = [];
  
  for (const part of parts) {
    if (part.startsWith('<comic-panel')) {
      // Handle comic panel
      const srcMatch = part.match(/src="([^"]*)"/);
      const altMatch = part.match(/alt="([^"]*)"/);
      const contentMatch = part.match(/>([\s\S]*?)<\/comic-panel>/);
      
      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : '';
      const content = contentMatch ? contentMatch[1].trim() : '';
      
      pages.push({
        id: pageIndex++,
        content: content, // Use inner content as caption/context
        chapter: 'Chapter I',
        type: 'comic',
        imageSrc: src,
        caption: alt
      });
    } else {
      // Handle regular text
      const paragraphs = part.split('\n\n').filter(p => p.trim().length > 0);
      let currentPageContent = '';
      
      for (const paragraph of paragraphs) {
        if (currentPageContent.length + paragraph.length > CHARS_PER_PAGE && currentPageContent.length > 0) {
          pages.push({
            id: pageIndex++,
            content: currentPageContent.trim(),
            chapter: 'Chapter I',
            type: 'text'
          });
          currentPageContent = '';
        }
        currentPageContent += paragraph + '\n\n';
      }
      
      if (currentPageContent.trim().length > 0) {
        pages.push({
          id: pageIndex++,
          content: currentPageContent.trim(),
          chapter: 'Chapter I',
          type: 'text'
        });
      }
    }
  }
  
  chapters.push({
    id: 1,
    title: 'Chapter I',
    pages: pages
  });
  
  return chapters;
}
