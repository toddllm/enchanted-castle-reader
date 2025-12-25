import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbox } from '@/components/Lightbox';
import { ZoomIn } from 'lucide-react';

interface ComicPageProps {
  imageSrc: string;
  caption?: string;
  dialogue?: string[];
  isActive: boolean;
}

export function ComicPage({ imageSrc, caption, dialogue, isActive }: ComicPageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!isActive) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto flex flex-col items-center px-4"
      >
        <div className="relative bg-card p-3 md:p-6 shadow-2xl rounded-sm border-4 border-primary/20 w-full">
          {/* Comic Panel Image */}
          <div 
            className="relative overflow-hidden rounded-sm border-2 border-primary/80 group cursor-zoom-in"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img 
              src={imageSrc} 
              alt={caption || "Comic Panel"} 
              className="w-full h-auto object-contain max-h-[65vh] bg-stone-100"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                <ZoomIn className="w-5 h-5" />
                <span className="font-medium">Zoom</span>
              </div>
            </div>
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

      <Lightbox 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        imageSrc={imageSrc} 
        alt={caption || "Comic Panel"} 
      />
    </>
  );
}
