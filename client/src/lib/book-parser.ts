export interface BookPage {
  id: number;
  content: string;
  chapter: string;
}

export interface Chapter {
  id: number;
  title: string;
  pages: BookPage[];
}

// This is a simplified parser. In a real app, we might want more robust parsing.
// For now, we'll split by paragraphs and group them into pages of roughly equal length.
const CHARS_PER_PAGE = 800;

export function parseBookContent(text: string): Chapter[] {
  // For this MVP, we're just handling Chapter 1
  // In the future, we'd parse the whole book structure
  
  const chapters: Chapter[] = [];
  
  // Clean up the text
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  
  // Split into paragraphs
  const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 0);
  
  let currentPageContent = '';
  let pageIndex = 1;
  const pages: BookPage[] = [];
  
  for (const paragraph of paragraphs) {
    if (currentPageContent.length + paragraph.length > CHARS_PER_PAGE && currentPageContent.length > 0) {
      pages.push({
        id: pageIndex++,
        content: currentPageContent.trim(),
        chapter: 'Chapter I'
      });
      currentPageContent = '';
    }
    
    currentPageContent += paragraph + '\n\n';
  }
  
  // Add the last page
  if (currentPageContent.trim().length > 0) {
    pages.push({
      id: pageIndex++,
      content: currentPageContent.trim(),
      chapter: 'Chapter I'
    });
  }
  
  chapters.push({
    id: 1,
    title: 'Chapter I',
    pages: pages
  });
  
  return chapters;
}
