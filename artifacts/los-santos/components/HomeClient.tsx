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
      {/* Hero */}
      <section className="relative bg-black overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 50%, #ffffff 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 flex flex-col items-start">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/20">
            Nova coleção
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-2xl">
            Bem-vindo à
            <br />
            <span className="text-gray-300">Los Santos</span>
          </h1>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-md leading-relaxed">
            Roupas, acessórios e perfumes com estilo. Encontre peças únicas para o seu look.
          </p>
          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Ver produtos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                scrollToProducts();
                setTimeout(() => searchRef.current?.focus(), 400);
              }}
              className="inline-flex items-center gap-2 border border-white/30 text-white font-medium text-sm px-6 py-3 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar produto
            </button>
          </div>
        </div>
      </section>

      {/* Search + Filters bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row gap-3">
          {/* Search input */}
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

          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.length === 0 ? (
              <span className="text-sm text-gray-400 italic">Nenhuma categoria cadastrada ainda</span>
            ) : (
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
      <section
        id="produtos"
        ref={productsRef}
        className="max-w-6xl mx-auto px-4 py-10"
      >
        {/* Header row */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight">
              {searchQuery.trim()
                ? `Resultados para "${searchQuery.trim()}"`
                : activeCategory
                ? activeCategory
                : "Produtos em destaque"}
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

        {/* Active filter tags */}
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

        {/* Grid or empty state */}
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

      {/* Category cards */}
      {!hasActiveFilters && (
        <section className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-xl font-bold text-black mb-6">Explorar por categoria</h2>
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-4">🏷️</div>
                <p className="text-gray-600 font-semibold text-base mb-1">
                  Nenhuma categoria cadastrada ainda
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Crie categorias para organizar seus produtos.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
                >
                  Criar categorias
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.categories?.name === cat.name).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="group bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-black hover:shadow-md transition-all"
                    >
                      <div className="text-2xl mb-3">{CATEGORY_ICONS[cat.name] ?? "🏷️"}</div>
                      <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {count} produto{count !== 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
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
