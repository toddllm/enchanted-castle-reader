export interface BookPage {
  id: number;
  content: string;
  chapter: string;
  type: 'text' | 'comic';
  imageSrc?: string;
  illustrationId?: string;
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
  
  // Split by Chapter headers (assuming format "CHAPTER I", "CHAPTER II", etc.)
  // We use a lookahead to keep the delimiter or capture it
  const chapterParts = cleanText.split(/(?=CHAPTER [IVX]+)/);
  
  let globalPageIndex = 1;
  
  chapterParts.forEach((chapterText, index) => {
    if (!chapterText.trim()) return;
    
    // Extract chapter title
    const titleMatch = chapterText.match(/CHAPTER [IVX]+/);
    const chapterTitle = titleMatch ? titleMatch[0] : `Chapter ${index + 1}`;
    
    // Remove the title from the content to avoid duplicating it
    const contentWithoutTitle = chapterText.replace(/CHAPTER [IVX]+[\s\n]*/, '');
    
    const pages: BookPage[] = [];
    
    // Split content by comic-panel tags to handle them separately
    const parts = contentWithoutTitle.split(/(<comic-panel[^>]*>[\s\S]*?<\/comic-panel>)/g);
    
    for (const part of parts) {
      if (part.startsWith('<comic-panel')) {
        // Handle comic panel
        const idMatch = part.match(/id="([^"]*)"/);
        const srcMatch = part.match(/src="([^"]*)"/);
        const altMatch = part.match(/alt="([^"]*)"/);
        const contentMatch = part.match(/>([\s\S]*?)<\/comic-panel>/);
        
        const src = srcMatch ? srcMatch[1] : undefined;
        const alt = altMatch ? altMatch[1] : '';
        const content = contentMatch ? contentMatch[1].trim() : '';
        const dialogue = content
          .split(/\n+/)
          .map(line => line.trim())
          .filter(Boolean);
        
        pages.push({
          id: globalPageIndex++,
          content: content, // Use inner content as caption/context
          chapter: chapterTitle,
          type: 'comic',
          imageSrc: src,
          illustrationId: idMatch ? idMatch[1] : undefined,
          caption: alt,
          dialogue: dialogue.length > 0 ? dialogue : undefined
        });
      } else {
        // Handle regular text
        const paragraphs = part.split('\n\n').filter(p => p.trim().length > 0);
        let currentPageContent = '';
        
        for (const paragraph of paragraphs) {
          if (currentPageContent.length + paragraph.length > CHARS_PER_PAGE && currentPageContent.length > 0) {
            pages.push({
              id: globalPageIndex++,
              content: currentPageContent.trim(),
              chapter: chapterTitle,
              type: 'text'
            });
            currentPageContent = '';
          }
          currentPageContent += paragraph + '\n\n';
        }
        
        if (currentPageContent.trim().length > 0) {
          pages.push({
            id: globalPageIndex++,
            content: currentPageContent.trim(),
            chapter: chapterTitle,
            type: 'text'
          });
        }
      }
    }
    
    if (pages.length > 0) {
      chapters.push({
        id: index + 1,
        title: chapterTitle,
        pages: pages
      });
    }
  });
  
  // If no chapters were detected (e.g. only one chapter without header), wrap everything in Chapter I
  if (chapters.length === 0 && cleanText.length > 0) {
    // Fallback to original logic for single chapter
    const pages: BookPage[] = [];
    const parts = cleanText.split(/(<comic-panel[^>]*>[\s\S]*?<\/comic-panel>)/g);
    
    for (const part of parts) {
      if (part.startsWith('<comic-panel')) {
        const idMatch = part.match(/id="([^"]*)"/);
        const srcMatch = part.match(/src="([^"]*)"/);
        const altMatch = part.match(/alt="([^"]*)"/);
        const contentMatch = part.match(/>([\s\S]*?)<\/comic-panel>/);
        const content = contentMatch ? contentMatch[1].trim() : '';
        const dialogue = content
          .split(/\n+/)
          .map(line => line.trim())
          .filter(Boolean);
        
        pages.push({
          id: globalPageIndex++,
          content: content,
          chapter: 'Chapter I',
          type: 'comic',
          imageSrc: srcMatch ? srcMatch[1] : undefined,
          illustrationId: idMatch ? idMatch[1] : undefined,
          caption: altMatch ? altMatch[1] : '',
          dialogue: dialogue.length > 0 ? dialogue : undefined
        });
      } else {
        const paragraphs = part.split('\n\n').filter(p => p.trim().length > 0);
        let currentPageContent = '';
        
        for (const paragraph of paragraphs) {
          if (currentPageContent.length + paragraph.length > CHARS_PER_PAGE && currentPageContent.length > 0) {
            pages.push({
              id: globalPageIndex++,
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
            id: globalPageIndex++,
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
  }
  
  return chapters;
}
