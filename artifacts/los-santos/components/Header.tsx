"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex-shrink-0 flex items-center">
          <Image
            src="/logo.png"
            alt="Los Santos"
            width={120}
            height={60}
            style={{ maxHeight: "60px", width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
              <span className="absolute -top-1 -right-1 sm:static sm:ml-0.5 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {count}
              </span>
            )}
          </Link>

        </nav>
      </div>
    </header>
  );
}
