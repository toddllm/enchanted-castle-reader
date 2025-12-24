import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ComicPageProps {
  imageSrc: string;
  caption?: string;
  dialogue?: string[];
  isActive: boolean;
}

export function ComicPage({ imageSrc, caption, dialogue, isActive }: ComicPageProps) {
  if (!isActive) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center"
    >
      <div className="relative bg-card p-4 shadow-2xl rounded-sm border-4 border-primary/20">
        {/* Comic Panel Image */}
        <div className="relative overflow-hidden rounded-sm border-2 border-primary/80">
          <img 
            src={imageSrc} 
            alt="Comic Panel" 
            className="w-full h-auto object-cover max-h-[60vh]"
          />
        </div>

        {/* Caption / Dialogue Area */}
        {(caption || (dialogue && dialogue.length > 0)) && (
          <div className="mt-6 font-serif text-lg md:text-xl leading-relaxed text-center max-w-2xl mx-auto">
            {caption && (
              <p className="text-muted-foreground italic mb-4">{caption}</p>
            )}
            {dialogue && dialogue.map((line, index) => (
              <p key={index} className="mb-2 font-medium text-foreground">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
