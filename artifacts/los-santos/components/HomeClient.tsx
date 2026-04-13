"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  Roupas: "👕",
  Acessórios: "👜",
  Perfumes: "✨",
  Outro: "📦",
};

interface Props {
  products: Product[];
}

export default function HomeClient({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  );

  const filtered =
    activeCategory === null
      ? products
      : products.filter((p) => p.category === activeCategory);

  function handleCategoryClick(cat: string | null) {
    setActiveCategory(cat);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 50%, #ffffff 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-start">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/20">
            Nova coleção
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl">
            Bem-vindo à
            <br />
            <span className="text-gray-300">Los Santos</span>
          </h1>
          <p className="mt-5 text-gray-400 text-base sm:text-lg max-w-md leading-relaxed">
            Roupas, acessórios e perfumes com estilo. Encontre peças únicas para o seu look.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <a
              href="#produtos"
              onClick={(e) => {
                e.preventDefault();
                productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Ver produtos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            {categories.length > 0 && (
              <a
                href="#categorias"
                onClick={(e) => {
                  e.preventDefault();
                  productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center gap-2 border border-white/30 text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                Ver categorias
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section id="categorias" className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === null
                    ? "bg-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
                <span className="text-xs opacity-70">({products.length})</span>
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat
                        ? "bg-black text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat] ?? "🏷️"}</span>
                    {cat}
                    <span className="text-xs opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products section */}
      <section
        id="produtos"
        ref={productsRef}
        className="max-w-6xl mx-auto px-4 py-12"
      >
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">
              {activeCategory ? activeCategory : "Produtos em destaque"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""} disponível
              {filtered.length !== 1 ? "is" : ""}
            </p>
          </div>
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1"
            >
              Limpar filtro
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">Nenhum produto encontrado</p>
            <p className="text-sm mt-1">
              Os produtos aparecerão aqui quando forem cadastrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Footer categories cards */}
      {categories.length > 0 && (
        <section className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-bold text-black mb-6">Explorar por categoria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      handleCategoryClick(cat);
                    }}
                    className="group bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-black hover:shadow-md transition-all"
                  >
                    <div className="text-2xl mb-3">{CATEGORY_ICONS[cat] ?? "🏷️"}</div>
                    <p className="font-semibold text-gray-900 text-sm">{cat}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {count} produto{count !== 1 ? "s" : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA bottom */}
      <section className="bg-black py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white text-2xl font-bold mb-2">Gostou do que viu?</p>
          <p className="text-gray-400 text-sm mb-7">
            Adicione produtos ao carrinho e finalize seu pedido.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Ir para o carrinho
          </Link>
        </div>
      </section>
    </>
  );
}
