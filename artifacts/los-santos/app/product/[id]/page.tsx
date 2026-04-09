"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductById, getProductVariants } from "@/services/products";
import { useCart } from "@/components/CartContext";
import type { Product, ProductVariant } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, v] = await Promise.all([
          getProductById(id),
          getProductVariants(id),
        ]);
        setProduct(p);
        setVariants(v);
        if (v.length > 0) setSelectedVariant(v[0]);
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
        <p className="text-gray-500 mb-4">Produto não encontrado.</p>
        <Link href="/" className="text-sm underline">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem(product!, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;

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
        <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs text-gray-500 uppercase tracking-widest mb-2">
              {product.category}
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

          {variants.length > 0 && (
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
                    <span
                      className={
                        selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"
                      }
                    >
                      {selectedVariant.stock > 0
                        ? `${selectedVariant.stock} disponíveis`
                        : "Esgotado"}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={
                !selectedVariant ||
                selectedVariant.stock === 0 ||
                variants.length === 0
              }
              className={`w-full py-3 px-6 rounded text-sm font-semibold transition-all ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {added ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}
            </button>

            <button
              onClick={() => {
                if (selectedVariant) {
                  addItem(product!, selectedVariant);
                  router.push("/cart");
                }
              }}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="w-full py-3 px-6 rounded text-sm font-semibold border border-black hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Comprar agora
            </button>
          </div>

          {variants.length === 0 && (
            <p className="text-sm text-gray-400 mt-4">
              Este produto não possui variações cadastradas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
