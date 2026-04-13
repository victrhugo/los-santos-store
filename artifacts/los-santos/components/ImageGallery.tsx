"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  priority?: boolean;
}

export function ImageGallery({ images, alt, priority = false }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

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

  const hasThumbs = images.length > 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priority}
        />
      </div>

      {/* Thumbnail strip */}
      {hasThumbs && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-black"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`Ver imagem ${idx + 1}`}
            >
              <Image
                src={url}
                alt={`${alt} ${idx + 1}`}
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
