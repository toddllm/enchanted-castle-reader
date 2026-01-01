import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lightbox } from '@/components/Lightbox';
import { ImageOff, ZoomIn } from 'lucide-react';
import { withBasePath } from '@/lib/assets';

interface ComicPageProps {
  imageSrc: string;
  caption?: string;
  dialogue?: string[];
  isActive: boolean;
}

export function ComicPage({ imageSrc, caption, dialogue, isActive }: ComicPageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hasError, setHasError] = useState(!imageSrc);
  const resolvedImageSrc = imageSrc ? withBasePath(imageSrc) : "";

  useEffect(() => {
    setHasError(!imageSrc);
  }, [imageSrc]);

  const handleOpenLightbox = () => {
    if (hasError) return;
    setIsLightboxOpen(true);
  };

  if (!isActive) return null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full h-full flex flex-col items-center"
      >
        <div className="relative bg-card p-3 md:p-6 shadow-2xl rounded-sm border-4 border-primary/20 w-full h-full overflow-hidden flex flex-col">
          {/* Comic Panel Image */}
          <div 
            className={cn(
              "relative flex-1 min-h-0 overflow-hidden rounded-sm border-2 border-primary/80 group flex items-center justify-center",
              hasError ? "cursor-default" : "cursor-zoom-in"
            )}
            onClick={handleOpenLightbox}
            data-testid="comic-panel"
          >
            {hasError ? (
              <div
                className="flex h-full w-full flex-col items-center justify-center gap-3 bg-stone-100 text-muted-foreground px-6 text-center"
                data-testid="comic-fallback"
              >
                <ImageOff className="w-10 h-10" />
                <p className="font-serif text-base">Illustration unavailable.</p>
              </div>
            ) : (
              <img 
                src={resolvedImageSrc} 
                alt={caption || "Comic Panel"} 
                className="w-full h-full object-contain bg-stone-100"
                onError={() => setHasError(true)}
                data-testid="comic-image"
              />
            )}
            
            {/* Hover Overlay */}
            {!hasError && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-black/50 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                  <ZoomIn className="w-5 h-5" />
                  <span className="font-medium">Zoom</span>
                </div>
              </div>
            )}
          </div>

          {/* Caption / Dialogue Area */}
          {(caption || (dialogue && dialogue.length > 0)) && (
            <div className="mt-6 font-serif text-lg md:text-xl leading-relaxed text-center max-w-2xl mx-auto">
              {caption && (!dialogue || dialogue.length === 0) && (
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
        isOpen={isLightboxOpen && !hasError} 
        onClose={() => setIsLightboxOpen(false)} 
        imageSrc={resolvedImageSrc} 
        alt={caption || "Comic Panel"} 
      />
    </>
  );
}
