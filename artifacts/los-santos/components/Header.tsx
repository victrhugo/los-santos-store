"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-black uppercase"
        >
          Los Santos
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Produtos
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-black transition-colors"
          >
            <span>Carrinho</span>
            {count > 0 && (
              <span className="ml-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
