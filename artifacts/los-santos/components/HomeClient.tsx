"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  Roupas: "👕",
  Óculos: "🕶️",
  Acessórios: "👜",
  Perfumes: "✨",
  Outro: "📦",
};

interface Props {
  products: Product[];
  categories: Category[];
}

function filterProducts(
  products: Product[],
  query: string,
  category: string | null
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const catName = p.categories?.name ?? "";
    const matchesCategory = category === null || catName === category;
    const matchesQuery =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

export default function HomeClient({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => filterProducts(products, searchQuery, activeCategory),
    [products, searchQuery, activeCategory]
  );

  const hasActiveFilters = searchQuery.trim() !== "" || activeCategory !== null;

  function handleCategoryClick(cat: string | null) {
    setActiveCategory(cat);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setActiveCategory(null);
  }

  function scrollToProducts() {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-xs font-medium tracking-wide overflow-x-auto whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
            </svg>
            Nova coleção disponível
          </span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Retirada na loja
          </span>
          <span className="text-white/30">·</span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Atendimento via WhatsApp
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 75% 50%, #4f46e5 0%, transparent 55%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-start">
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Nova coleção
          </span>
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.05] max-w-2xl">
            Los Santos
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
              Store
            </span>
          </h1>
          <p className="mt-5 text-gray-400 text-base sm:text-lg max-w-md leading-relaxed">
            Roupas, acessórios e perfumes com estilo. Peças únicas para o seu look.
          </p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center gap-2 bg-white text-black font-bold text-sm px-7 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
            >
              Ver produtos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                scrollToProducts();
                setTimeout(() => searchRef.current?.focus(), 400);
              }}
              className="inline-flex items-center gap-2 border border-white/20 text-white/80 font-medium text-sm px-7 py-3.5 rounded-full hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar produto
            </button>
          </div>
        </div>
      </section>

      {/* Category cards — shown above products when no active filter */}
      {!hasActiveFilters && categories.length > 0 && (
        <section className="border-b border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-base font-bold text-black tracking-tight">Explorar por categoria</h2>
              <button
                onClick={() => handleCategoryClick(null)}
                className="text-xs text-gray-400 hover:text-black transition-colors"
              >
                Ver todos
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categories?.name === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="group relative bg-gray-50 hover:bg-black border border-gray-100 hover:border-black rounded-2xl p-5 text-left transition-all duration-200 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ backgroundImage: "radial-gradient(circle at 80% 20%, #374151 0%, transparent 70%)" }}
                    />
                    <div className="relative">
                      <div className="text-2xl mb-3">{CATEGORY_ICONS[cat.name] ?? "🏷️"}</div>
                      <p className="font-semibold text-gray-900 group-hover:text-white text-sm transition-colors">{cat.name}</p>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300 mt-0.5 transition-colors">
                        {count} produto{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search + Filters sticky bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produto por nome..."
              className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.length > 0 && (
              <>
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === null
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeCategory === cat.name
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span className="text-base leading-none">{CATEGORY_ICONS[cat.name] ?? "🏷️"}</span>
                    {cat.name}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products section */}
      <section id="produtos" ref={productsRef} className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">
              {searchQuery.trim()
                ? `Resultados para "${searchQuery.trim()}"`
                : activeCategory
                ? activeCategory
                : "Todos os produtos"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""}{" "}
              encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                "{searchQuery.trim()}"
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-black">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {CATEGORY_ICONS[activeCategory] ?? "🏷️"} {activeCategory}
                <button onClick={() => setActiveCategory(null)} className="ml-1 hover:text-black">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-gray-200 mb-4">
              <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-semibold text-lg">Nenhum produto encontrado</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              {hasActiveFilters
                ? "Tente outros termos ou remova os filtros ativos."
                : "Os produtos aparecerão aqui quando forem cadastrados."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA bottom */}
      <section className="bg-black py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white text-2xl font-bold mb-2">Gostou do que viu?</p>
          <p className="text-gray-400 text-sm mb-7">
            Adicione produtos ao carrinho e finalize seu pedido com entrega ou retirada.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
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
