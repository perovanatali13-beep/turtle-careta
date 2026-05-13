'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn } from 'lucide-react';

// ── Overlay ──────────────────────────────────────────────────────────────────

function LightboxOverlay({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 rounded-full p-2 transition-colors"
        aria-label="Закрыть"
      >
        <X size={24} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ''}
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl object-contain"
      />
    </div>
  );
}

// ── Single clickable image ────────────────────────────────────────────────────

interface ClickableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ClickableImage({ src, alt, className }: ClickableImageProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span
        className="relative inline-block group cursor-zoom-in"
        onClick={() => setOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ''} className={className} />
        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center pointer-events-none">
          <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow" />
        </span>
      </span>
      {open && <LightboxOverlay src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── HTML content with clickable images ───────────────────────────────────────

export function ArticleContent({ html }: { html: string }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const src = (target as HTMLImageElement).src;
      if (src) setLightboxSrc(src);
    }
  }

  return (
    <>
      <div
        className="prose prose-lg max-w-none text-[var(--color-text)] leading-relaxed [&_img]:cursor-zoom-in [&_img]:rounded-xl [&_img]:max-w-[500px] [&_img]:max-h-[400px] [&_img]:w-auto [&_img]:h-auto [&_img]:object-contain [&_img]:hover:opacity-90 [&_img]:transition-opacity"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
      {lightboxSrc && (
        <LightboxOverlay src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}
    </>
  );
}
