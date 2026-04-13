"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";

export interface ImageEntry {
  key: string;
  preview: string;
  file?: File;
  id?: string;
  isPrimary?: boolean;
}

interface MultiImageUploadProps {
  entries: ImageEntry[];
  onAddFiles: (files: File[]) => void;
  onRemove: (key: string) => void;
  disabled?: boolean;
}

export function MultiImageUpload({
  entries,
  onAddFiles,
  onRemove,
  disabled = false,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const valid = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (valid.length > 0) onAddFiles(valid);
    },
    [onAddFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div>
      {/* Preview grid */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {entries.map((entry, idx) => (
            <div key={entry.key} className="relative group aspect-square">
              <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                <Image
                  src={entry.preview}
                  alt={`Imagem ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                  unoptimized={entry.preview.startsWith("data:")}
                />
              </div>
              {/* Primary badge */}
              {(entry.isPrimary || idx === 0) && (
                <span className="absolute top-1 left-1 text-[10px] font-semibold bg-black text-white px-1.5 py-0.5 rounded">
                  Capa
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(entry.key)}
                disabled={disabled}
                className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:cursor-not-allowed"
                aria-label="Remover imagem"
              >
                <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
          disabled
            ? "border-gray-100 cursor-not-allowed opacity-50"
            : "border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
        }`}
      >
        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-xs text-gray-400 font-medium">
          {entries.length === 0 ? "Arraste ou clique para adicionar imagens" : "Adicionar mais imagens"}
        </p>
        <p className="text-xs text-gray-300">PNG, JPG, WEBP · Múltiplas permitidas</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
