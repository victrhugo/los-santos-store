"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-start"
          aria-label="Los Santos — início"
        >
          <Image
            src="/logo.png"
            alt="Los Santos"
            width={180}
            height={48}
            className="h-12 max-h-[50px] min-h-[40px] w-auto object-contain object-left"
            priority
          />
        </Link>

        <div className="flex shrink-0 items-center">
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
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
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs leading-none text-white sm:static sm:ml-0.5">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
