import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BookPage as BookPageType } from '@/lib/book-parser';

interface BookPageProps {
  page: BookPageType;
  isActive: boolean;
  pageNumber: number;
  totalPages: number;
}

export function BookPage({ page, isActive, pageNumber, totalPages }: BookPageProps) {
  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card shadow-xl rounded-sm p-8 md:p-12 border border-border relative overflow-hidden">
        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent opacity-50 rounded-tl-lg m-2" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-accent opacity-50 rounded-tr-lg m-2" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-accent opacity-50 rounded-bl-lg m-2" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent opacity-50 rounded-br-lg m-2" />

        {/* Page Header */}
        <div className="flex justify-between items-center mb-8 text-muted-foreground font-serif italic text-sm">
          <span>{page.chapter}</span>
          <span>Page {pageNumber} of {totalPages}</span>
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-stone max-w-none font-serif leading-relaxed text-foreground">
          {page.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 first-letter:text-5xl first-letter:font-display first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Page Footer Decoration */}
        <div className="mt-12 flex justify-center opacity-40">
          <img src="/images/chapter-decor.png" alt="Decoration" className="h-12 w-auto mix-blend-multiply" />
        </div>
      </div>
    </motion.div>
  );
}
