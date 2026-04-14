"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex min-h-[78px] max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3"
          aria-label="Los Santos — início"
        >
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt="Los Santos"
              width={88}
              height={88}
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
              priority
            />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">
              Los Santos
            </p>
            <p className="truncate text-lg font-black tracking-tight text-stone-900 sm:text-xl">
              Store
            </p>
            <p className="hidden text-xs text-stone-500 sm:block">
              Moda, acessorios e perfumes
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center">
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-sm font-semibold text-stone-700 transition-all hover:border-stone-300 hover:bg-white hover:text-black hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] sm:px-4"
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <div className="hidden text-left sm:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                Sacola
              </p>
              <p className="leading-none text-stone-800">Carrinho</p>
            </div>
            <span className="sm:hidden">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs leading-none text-white shadow-sm sm:static sm:ml-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
