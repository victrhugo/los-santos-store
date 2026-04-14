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
      <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-gray-300">
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const safeIndex = Math.min(Math.max(0, activeIndex), images.length - 1);
  const thumbIndices = images.map((_, idx) => idx).filter((idx) => idx !== safeIndex);
  const hasThumbs = thumbIndices.length > 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Capa: uma imagem grande */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
        <Image
          src={images[safeIndex]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
      </div>

      {/* Miniaturas: demais imagens (a capa não se repete aqui) */}
      {hasThumbs && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {thumbIndices.map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 border-transparent transition-all hover:border-gray-300"
              aria-label={`Ver imagem ${idx + 1}`}
            >
              <Image
                src={images[idx]}
                alt={`${alt} — miniatura ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
