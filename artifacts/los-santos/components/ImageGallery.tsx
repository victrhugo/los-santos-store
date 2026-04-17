"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  priority?: boolean;
}

export function ImageGallery({ images, alt, priority = false }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex((i) =>
      images.length === 0 ? 0 : Math.min(Math.max(0, i), images.length - 1)
    );
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200">
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, activeIndex), images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50">
        <Image
          key={safeIndex}
          src={images[safeIndex]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
        {/* Navigation arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label="Imagem anterior"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              aria-label="Próxima imagem"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {/* Dot indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`rounded-full transition-all ${
                    idx === safeIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Imagem ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl transition-all ${
                idx === safeIndex
                  ? "ring-2 ring-black ring-offset-1"
                  : "ring-1 ring-gray-200 hover:ring-gray-400 opacity-70 hover:opacity-100"
              }`}
              aria-label={`Ver imagem ${idx + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} — ${idx + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
