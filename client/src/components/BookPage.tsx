import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbox } from '@/components/Lightbox';
import { ZoomIn } from 'lucide-react';
import { BookPage as BookPageType } from '@/lib/book-parser';
import { withBasePath } from '@/lib/assets';

interface BookPageProps {
  page: BookPageType;
  isActive: boolean;
  pageNumber: number;
  totalPages: number;
}

export function BookPage({ page, isActive, pageNumber, totalPages }: BookPageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const resolvedImageSrc = page.imageSrc ? withBasePath(page.imageSrc) : "";

  if (!isActive) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full h-full"
      >
        <div className="bg-card shadow-xl rounded-sm p-6 md:p-12 border border-border relative h-full overflow-hidden flex flex-col">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent opacity-50 rounded-tl-lg m-2" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent opacity-50 rounded-tr-lg m-2" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent opacity-50 rounded-bl-lg m-2" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent opacity-50 rounded-br-lg m-2" />

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8 text-muted-foreground font-serif italic text-sm">
            <span data-testid="page-chapter">{page.chapter}</span>
            <span>Page {pageNumber} of {totalPages}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div className="prose prose-lg prose-stone max-w-none font-serif leading-relaxed text-foreground">
              {page.type === 'comic' ? (
                <div className="flex flex-col items-center my-8">
                  <div 
                    className="relative p-2 bg-white shadow-lg rotate-1 transform transition-all hover:rotate-0 duration-500 border-4 border-stone-200 group cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <img 
                      src={resolvedImageSrc} 
                      alt={page.caption || "Comic panel"} 
                      className="w-full h-auto max-h-[60vh] object-contain rounded-sm"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/50 text-white px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm scale-90 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-sm font-medium">Zoom</span>
                      </div>
                    </div>
                  </div>
                  {page.content && (
                    <p className="mt-6 text-lg italic text-center text-stone-600 font-medium max-w-lg">
                      {page.content}
                    </p>
                  )}
                </div>
              ) : (
                page.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={cn(
                    "mb-6",
                    index === 0 && pageNumber === 1 ? "first-letter:text-5xl first-letter:font-display first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]" : ""
                  )}>
                    {paragraph}
                  </p>
                ))
              )}
            </div>
          </div>

          {/* Page Footer Decoration */}
          <div className="pt-8 flex justify-center opacity-40">
            <img src={withBasePath("/images/chapter-decor.png")} alt="Decoration" className="h-12 w-auto mix-blend-multiply" />
          </div>
        </div>
      </motion.div>

      {page.type === 'comic' && page.imageSrc && (
        <Lightbox 
          isOpen={isLightboxOpen} 
          onClose={() => setIsLightboxOpen(false)} 
          imageSrc={resolvedImageSrc} 
          alt={page.caption || "Comic panel"} 
        />
      )}
    </>
  );
}
