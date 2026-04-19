"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useCartUI } from "@/components/CartUIContext";

export default function Header() {
  const { count } = useCart();
  const { openCart } = useCartUI();

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Spacer left — mirrors cart button width for centering */}
        <div className="w-[110px]" />

        {/* Logo — centered */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 group"
          aria-label="Los Santos Store — início"
        >
          <div className="h-11 w-11 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100 group-hover:ring-gray-300 transition-all">
            <Image
              src="/logo.png"
              alt="Los Santos Store"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </Link>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative flex items-center gap-2 bg-gray-950 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="hidden sm:inline">Carrinho</span>
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black leading-none text-gray-900 shadow-sm">
              {count}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
