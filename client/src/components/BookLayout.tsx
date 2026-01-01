import React from 'react';
import { withBasePath } from '@/lib/assets';
import { cn } from '@/lib/utils';

interface BookLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function BookLayout({ children, className }: BookLayoutProps) {
  const paperTexture = withBasePath("/images/paper-texture.png");

  return (
    <div className={cn("min-h-screen w-full bg-background relative overflow-hidden", className)}>
      {/* Background Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply bg-repeat"
        style={{ backgroundImage: `url(${paperTexture})` }}
      />
      
      {/* Vine Borders - SVG Decoration */}
      <div className="fixed top-0 left-0 w-full h-16 z-10 pointer-events-none opacity-80">
        <svg width="100%" height="100%" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,0 C300,50 600,0 1200,30 L1200,0 L0,0 Z" fill="var(--primary)" fillOpacity="0.1" />
          <path d="M0,0 C400,40 800,10 1200,20 L1200,0 L0,0 Z" fill="var(--primary)" fillOpacity="0.2" />
        </svg>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full h-16 z-10 pointer-events-none opacity-80 rotate-180">
        <svg width="100%" height="100%" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,0 C300,50 600,0 1200,30 L1200,0 L0,0 Z" fill="var(--primary)" fillOpacity="0.1" />
          <path d="M0,0 C400,40 800,10 1200,20 L1200,0 L0,0 Z" fill="var(--primary)" fillOpacity="0.2" />
        </svg>
      </div>

      {/* Main Content Area */}
      <main className="relative z-20 container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
