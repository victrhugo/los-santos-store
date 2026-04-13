"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  adminCreateProduct,
  adminCreateVariant,
  adminDeleteVariant,
  adminGetVariants,
  uploadProductImage,
} from "@/services/admin";
import type { Product, ProductVariant } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const CATEGORIES = ["Roupas", "Acessórios", "Perfumes", "Outro"];

export default function NewProductPage() {
  const router = useRouter();

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [savedProduct, setSavedProduct] = useState<Product | null>(null);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState({ name: "", price: "", stock: "" });
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setProductError("O nome do produto é obrigatório.");
      return;
    }
    setProductLoading(true);
    setProductError(null);
    try {
      let image_url: string | undefined;
      if (imageFile) {
        image_url = await uploadProductImage(imageFile);
      }
      const product = await adminCreateProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category.trim(),
        price: productForm.price ? parseFloat(productForm.price) : 0,
        image_url,
      });
      setSavedProduct(product);
      const existing = await adminGetVariants(product.id);
      setVariants(existing);
    } catch (e) {
      setProductError(e instanceof Error ? e.message : "Erro ao salvar produto.");
    } finally {
      setProductLoading(false);
    }
  }

  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!savedProduct) return;
    if (!variantForm.name.trim() || !variantForm.price) {
      setVariantError("Nome e preço são obrigatórios.");
      return;
    }
    setVariantLoading(true);
    setVariantError(null);
    try {
      const variant = await adminCreateVariant({
        product_id: savedProduct.id,
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

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-black hover:border-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-black">Novo produto</h1>
          <p className="text-xs text-gray-400 mt-0.5">Preencha os dados e adicione as variantes</p>
        </div>
      </div>

      {/* Step 1 - Product Info */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
            1
          </span>
          Informações do produto
        </h2>

        {savedProduct ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">
              Produto <strong>{savedProduct.name}</strong> salvo com sucesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSaveProduct} className="space-y-5">
            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Imagem do produto
              </label>

              {imagePreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Trocar imagem
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="bg-white text-red-500 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className={`w-8 h-8 mb-2 transition-colors ${isDragging ? "text-black" : "text-gray-300"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-medium">
                    {isDragging ? "Solte a imagem aqui" : "Arraste ou clique para fazer upload"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP até 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Nome *
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Camiseta Premium"
                required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Descrição
              </label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o produto, materiais, diferenciais..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Categoria
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="">Selecione...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Preço base (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="0,00"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            </div>

            {productError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {productError}
              </div>
            )}

            <button
              type="submit"
              disabled={productLoading}
              className="w-full bg-black text-white text-sm font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {productLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {imageFile ? "Enviando imagem..." : "Salvando..."}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar produto
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Step 2 - Variants */}
      {savedProduct && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            Variantes
            <span className="ml-auto text-xs text-gray-400 font-normal">
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
                    className="text-gray-300 hover:text-red-500 transition-colors ml-3"
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
                  onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Preto M, 100ml"
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
                  onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
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
                  onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))}
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

            <div className="flex items-center gap-3">
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

              <button
                type="button"
                onClick={() => router.push("/admin/products")}
                className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Concluir
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
