"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  adminCreateVariant,
  adminDeleteVariant,
  adminGetVariants,
} from "@/services/admin";
import { getProductById } from "@/services/products";
import type { Product, ProductVariant } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const [variantForm, setVariantForm] = useState({
    name: "",
    price: "",
    stock: "",
  });
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getProductById(id), adminGetVariants(id)])
      .then(([p, v]) => {
        setProduct(p);
        setVariants(v);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!variantForm.name.trim() || !variantForm.price) {
      setVariantError("Nome e preço são obrigatórios.");
      return;
    }
    setVariantLoading(true);
    setVariantError(null);
    try {
      const variant = await adminCreateVariant({
        product_id: id,
        name: variantForm.name.trim(),
        price: parseFloat(variantForm.price),
        stock: parseInt(variantForm.stock) || 0,
      });
      setVariants((prev) => [...prev, variant]);
      setVariantForm({ name: "", price: "", stock: "" });
    } catch (e) {
      setVariantError(e instanceof Error ? e.message : "Erro ao adicionar variante.");
    } finally {
      setVariantLoading(false);
    }
  }

  async function handleDeleteVariant(variantId: string) {
    await adminDeleteVariant(variantId);
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link href="/admin/products" className="text-sm underline mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-gray-400 hover:text-black transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-black">{product.name}</h1>
          {product.categories?.name && (
            <span className="text-xs text-gray-400">{product.categories.name}</span>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Variantes
          <span className="ml-2 text-xs font-normal text-gray-400">
            {variants.length} variante(s)
          </span>
        </h2>

        {variants.length > 0 && (
          <div className="mb-5 space-y-2">
            {variants.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatPrice(v.price)} · Estoque: {v.stock}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteVariant(v.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddVariant} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Nome *
              </label>
              <input
                type="text"
                value={variantForm.name}
                onChange={(e) =>
                  setVariantForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Ex: Preto M"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Preço (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={variantForm.price}
                onChange={(e) =>
                  setVariantForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="0,00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Estoque
              </label>
              <input
                type="number"
                min="0"
                value={variantForm.stock}
                onChange={(e) =>
                  setVariantForm((f) => ({ ...f, stock: e.target.value }))
                }
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {variantError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {variantError}
            </div>
          )}

          <button
            type="submit"
            disabled={variantLoading}
            className="flex items-center gap-2 border border-black text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {variantLoading ? "Adicionando..." : "Adicionar variante"}
          </button>
        </form>
      </div>
    </div>
  );
}
