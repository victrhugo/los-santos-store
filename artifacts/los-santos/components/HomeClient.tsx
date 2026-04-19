"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Shirt, ShoppingBag, Sparkles, Package, Tag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { Category, Product, Subcategory } from "@/types";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Roupas:     Shirt,
  Acessórios: ShoppingBag,
  Perfumes:   Sparkles,
  Outro:      Package,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? Tag;
  return <Icon className={className} strokeWidth={1.75} />;
}

interface Props {
  products: Product[];
  categories: Category[];
  featuredProducts: Product[];
}

function filterProducts(
  products: Product[],
  query: string,
  category: string | null,
  subcategory: string | null
): Product[] {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const catName = p.categories?.name ?? "";
    const subName = p.subcategories?.name ?? "";
    const matchesCategory = category === null || catName === category;
    const matchesSubcategory = subcategory === null || subName === subcategory;
    const matchesQuery =
      q === "" ||
      p.name.toLowerCase().includes(q) ||
      (p.description ?? "").toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q) ||
      subName.toLowerCase().includes(q);
    return matchesCategory && matchesSubcategory && matchesQuery;
  });
}

export default function HomeClient({ products, categories, featuredProducts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => filterProducts(products, searchQuery, activeCategory, activeSubcategory),
    [products, searchQuery, activeCategory, activeSubcategory]
  );

  // Derive subcategories available for the active category from product data
  const availableSubcategories = useMemo<Subcategory[]>(() => {
    if (!activeCategory) return [];
    const seen = new Set<string>();
    const subs: Subcategory[] = [];
    for (const p of products) {
      if (p.categories?.name === activeCategory && p.subcategories) {
        const sub = p.subcategories;
        if (!seen.has(sub.id)) {
          seen.add(sub.id);
          subs.push(sub);
        }
      }
    }
    return subs.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [products, activeCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || activeCategory !== null || activeSubcategory !== null;

  function handleCategoryClick(cat: string | null) {
    setActiveCategory(cat);
    setActiveSubcategory(null);
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function clearAllFilters() {
    setSearchQuery("");
    setActiveCategory(null);
    setActiveSubcategory(null);
  }

  function scrollToProducts() {
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gray-950 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-center gap-8 overflow-x-auto whitespace-nowrap">
          <span className="flex items-center gap-2 text-[11px] font-medium text-white/60 tracking-wide">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Nova coleção disponível
          </span>
          <span className="w-px h-3 bg-white/15 flex-shrink-0" />
          <span className="flex items-center gap-2 text-[11px] font-medium text-white/60 tracking-wide">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Retirada na loja
          </span>
          <span className="w-px h-3 bg-white/15 flex-shrink-0" />
          <span className="flex items-center gap-2 text-[11px] font-medium text-white/60 tracking-wide">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Atendimento via WhatsApp
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-black overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Color glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(ellipse at 70% 60%, #4f46e5 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-20 flex flex-col items-start animate-[fadeIn_0.5s_ease]">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5 border border-white/15">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Nova coleção
          </span>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] max-w-xl">
            Los Santos
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">
              Store
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-gray-400 text-sm sm:text-base max-w-sm leading-relaxed">
            Roupas, acessórios e perfumes com estilo.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center gap-1.5 bg-white text-black font-bold text-sm px-5 py-2.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all shadow-md shadow-white/10"
            >
              Ver produtos
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                scrollToProducts();
                setTimeout(() => searchRef.current?.focus(), 400);
              }}
              className="inline-flex items-center gap-1.5 border border-white/20 text-white/70 font-medium text-sm px-5 py-2.5 rounded-full hover:bg-white/10 hover:text-white active:scale-95 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-black">Destaques</h2>
                <p className="text-sm text-gray-500 mt-1">Selecionados especialmente para você</p>
              </div>
              <button
                onClick={scrollToProducts}
                className="text-xs font-semibold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
              >
                Ver todos
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category cards — shown above products when no active filter */}
      {!hasActiveFilters && categories.length > 0 && (
        <section className="bg-[#f4f4f5] border-b border-gray-200/60">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-base font-semibold text-black tracking-tight">Explorar por categoria</h2>
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
                      <div className="mb-3 w-7 h-7 text-gray-400 group-hover:text-white/70 transition-colors">
                        <CategoryIcon name={cat.name} className="w-7 h-7" />
                      </div>
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

      {/* Search + subcategory filter bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 pt-3 pb-0">
          {/* Search row */}
          <div className="relative pb-3">
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
              placeholder={activeCategory ? `Buscar em ${activeCategory}...` : "Buscar produto por nome..."}
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

          {/* Subcategory pills — only when a category is active and has subcategories */}
          {activeCategory && availableSubcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 border-t border-gray-100 pt-2.5">
              <button
                onClick={() => setActiveSubcategory(null)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeSubcategory === null
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todos
              </button>
              {availableSubcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() =>
                    setActiveSubcategory(activeSubcategory === sub.name ? null : sub.name)
                  }
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeSubcategory === sub.name
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products section */}
      <section id="produtos" ref={productsRef} className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery.trim()
                ? `Resultados para "${searchQuery.trim()}"`
                : activeSubcategory
                ? activeSubcategory
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
                &quot;{searchQuery.trim()}&quot;
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-black">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <CategoryIcon name={activeCategory} className="w-3 h-3 flex-shrink-0" />
                {activeCategory}
                <button onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }} className="ml-1 hover:text-black">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {activeSubcategory && (
              <span className="inline-flex items-center gap-1.5 bg-black text-white text-xs font-medium px-3 py-1.5 rounded-full">
                {activeSubcategory}
                <button onClick={() => setActiveSubcategory(null)} className="ml-1 hover:text-gray-300">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-white text-3xl font-black tracking-tight mb-3">Gostou do que viu?</p>
          <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Adicione produtos ao carrinho e finalize seu pedido com entrega ou retirada.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 bg-white text-black font-bold text-sm px-8 py-4 rounded-full hover:bg-gray-100 active:scale-95 transition-all shadow-xl shadow-white/5"
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
