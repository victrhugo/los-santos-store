"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Logo + Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Los Santos Store — início"
        >
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100 group-hover:ring-gray-200 transition-all">
            <Image
              src="/logo.png"
              alt="Los Santos"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-black tracking-tight text-gray-900 leading-none">
              Los Santos Store
            </p>
            <p className="text-[10px] font-medium tracking-[0.2em] text-gray-400 uppercase mt-1">
              Moda & Estilo
            </p>
          </div>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
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
        </Link>

      </div>
    </header>
  );
}
