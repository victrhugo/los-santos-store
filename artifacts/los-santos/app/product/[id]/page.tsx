"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, getProductVariants, getProductImages } from "@/services/products";
import { useCart } from "@/components/CartContext";
import { ImageGallery } from "@/components/ImageGallery";
import { buildProductGalleryUrls } from "@/lib/productGallery";
import type { Product, ProductVariant } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function syntheticVariant(product: Product): ProductVariant {
  return {
    id: product.id,
    product_id: product.id,
    name: "Padrão",
    price: product.price,
    stock: 9999,
    created_at: product.created_at,
  };
}

function StockIndicator({ stock, hasRealVariants }: { stock: number; hasRealVariants: boolean }) {
  if (!hasRealVariants) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Disponível
      </span>
    );
  }
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Esgotado
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        Últimas {stock} unidade{stock > 1 ? "s" : ""}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      Em estoque
    </span>
  );
}

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ product: p, error: prodError }, v, imgs] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
          getProductImages(id),
        ]);
        if (prodError) setLoadError(prodError);
        setProduct(p);
        setVariants(v);

        if (v.length > 0) {
          setSelectedVariant(v[0]);
        } else if (p) {
          setSelectedVariant(syntheticVariant(p));
        }

        if (p) {
          setGalleryImages(buildProductGalleryUrls(p.image_url, imgs));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        {loadError ? (
          <>
            <p className="text-red-500 font-medium mb-1">Erro ao carregar produto</p>
            <p className="text-sm text-gray-400 mb-4">{loadError}</p>
          </>
        ) : (
          <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        )}
        <Link href="/" className="text-sm underline">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  const hasRealVariants = variants.length > 0;
  const isSoldOut = hasRealVariants && variants.every((v) => v.stock <= 0);
  const effectiveVariant = selectedVariant ?? (hasRealVariants ? null : syntheticVariant(product));
  const displayPrice = effectiveVariant ? effectiveVariant.price : product.price;
  const canBuy = !isSoldOut && effectiveVariant !== null && (hasRealVariants ? effectiveVariant.stock > 0 : true);
  const stockCount = hasRealVariants ? (effectiveVariant?.stock ?? 0) : 9999;

  function handleAddToCart() {
    if (!effectiveVariant) return;
    addItem(product!, effectiveVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!effectiveVariant) return;
    addItem(product!, effectiveVariant);
    router.push("/cart");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para a loja
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <ImageGallery key={product.id} images={galleryImages} alt={product.name} priority />

        {/* Info */}
        <div className="flex flex-col">
          {/* Category */}
          {product.categories?.name && (
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {product.categories.name}
            </span>
          )}

          {/* Name */}
          <h1 className="text-3xl font-black text-black leading-tight tracking-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-4">
            <span className="text-4xl font-black text-black tracking-tight">
              {formatPrice(displayPrice)}
            </span>
          </div>

          {/* Stock indicator */}
          <div className="mb-6">
            <StockIndicator stock={stockCount} hasRealVariants={hasRealVariants} />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 mb-6" />

          {/* Variants */}
          {hasRealVariants && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Variação
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-black bg-black text-white"
                        : v.stock === 0
                        ? "border-gray-100 text-gray-300 cursor-not-allowed line-through bg-gray-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-900 hover:text-black"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Sobre o produto
              </p>
              <p className="text-sm text-gray-600 leading-7">
                {product.description}
              </p>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 mt-auto">
            {/* Primary: Comprar agora */}
            <button
              onClick={handleBuyNow}
              disabled={!canBuy}
              className="w-full inline-flex items-center justify-center gap-2 bg-black text-white font-bold text-base py-4 px-6 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-black/10"
            >
              {isSoldOut ? (
                "Indisponível"
              ) : (
                <>
                  Comprar agora
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Secondary: Adicionar ao carrinho */}
            <button
              onClick={handleAddToCart}
              disabled={!canBuy}
              className={`w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-3.5 px-6 rounded-xl border-2 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${
                added
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-gray-200 text-gray-700 hover:border-black hover:text-black"
              }`}
            >
              {added ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Adicionado!
                </>
              ) : isSoldOut ? (
                "Produto esgotado"
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Adicionar ao carrinho
                </>
              )}
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Retirada na loja ou envio via Uber
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Atendimento via WhatsApp
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
