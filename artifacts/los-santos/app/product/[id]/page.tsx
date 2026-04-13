"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, getProductVariants, getProductImages } from "@/services/products";
import { useCart } from "@/components/CartContext";
import { ImageGallery } from "@/components/ImageGallery";
import type { Product, ProductVariant } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Creates a synthetic variant from the product itself for no-variant products. */
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
          getProductImages(id ?? ""),
        ]);
        if (prodError) setLoadError(prodError);
        setProduct(p);
        setVariants(v);

        if (v.length > 0) {
          setSelectedVariant(v[0]);
        } else if (p) {
          setSelectedVariant(syntheticVariant(p));
        }

        // Build image list: primary first, then additional
        if (p) {
          const extraUrls = imgs.map((i) => i.image_url);
          const allUrls = p.image_url
            ? [p.image_url, ...extraUrls.filter((u) => u !== p.image_url)]
            : extraUrls;
          setGalleryImages(allUrls);
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
  const effectiveVariant = selectedVariant ?? (hasRealVariants ? null : syntheticVariant(product));
  const displayPrice = effectiveVariant ? effectiveVariant.price : product.price;
  const canBuy = effectiveVariant !== null && (hasRealVariants ? effectiveVariant.stock > 0 : true);

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
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <ImageGallery images={galleryImages} alt={product.name} priority />

        {/* Info */}
        <div className="flex flex-col">
          {product.categories?.name && (
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              {product.categories.name}
            </span>
          )}

          <h1 className="text-2xl font-bold text-black mb-2">{product.name}</h1>

          <p className="text-2xl font-bold text-black mb-4">
            {formatPrice(displayPrice)}
          </p>

          {product.description && (
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Variants selector */}
          {hasRealVariants && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Variação
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 text-sm rounded border transition-all ${
                      selectedVariant?.id === v.id
                        ? "border-black bg-black text-white"
                        : v.stock === 0
                        ? "border-gray-200 text-gray-300 cursor-not-allowed line-through"
                        : "border-gray-300 text-gray-700 hover:border-black"
                    }`}
                  >
                    {v.name}
                    {v.stock === 0 && " (esgotado)"}
                  </button>
                ))}
              </div>

              {selectedVariant && (
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>Preço: {formatPrice(selectedVariant.price)}</span>
                  <span>
                    Estoque:{" "}
                    <span className={selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"}>
                      {selectedVariant.stock > 0
                        ? `${selectedVariant.stock} disponíveis`
                        : "Esgotado"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* No-variant badge */}
          {!hasRealVariants && (
            <div className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Produto disponível
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={!canBuy}
              className={`w-full py-3 px-6 rounded text-sm font-semibold transition-all ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {added ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canBuy}
              className="w-full py-3 px-6 rounded text-sm font-semibold border border-black hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comprar agora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
