"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminCreateProduct,
  adminCreateVariant,
  adminDeleteVariant,
  adminGetVariants,
  adminAddProductImages,
  getCategories,
  getSubcategories,
  uploadProductImage,
} from "@/services/admin";
import { MultiImageUpload, type ImageEntry } from "@/components/MultiImageUpload";
import type { Category, Product, ProductVariant, Subcategory } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    price: "",
    featured: false,
    featured_order: "",
  });
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [savedProduct, setSavedProduct] = useState<Product | null>(null);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState({ name: "", price: "", stock: "" });
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!productForm.category_id) {
      setSubcategories([]);
      setProductForm((f) => ({ ...f, subcategory_id: "" }));
      return;
    }
    getSubcategories(productForm.category_id)
      .then(setSubcategories)
      .catch(() => setSubcategories([]));
  }, [productForm.category_id]);

  const handleAddFiles = useCallback((files: File[]) => {
    const newEntries: ImageEntry[] = files.map((file) => ({
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      preview: URL.createObjectURL(file),
      file,
    }));
    setImageEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const handleRemove = useCallback((key: string) => {
    setImageEntries((prev) => {
      const entry = prev.find((e) => e.key === key);
      if (entry?.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.key !== key);
    });
  }, []);

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productForm.name.trim()) {
      setProductError("O nome do produto é obrigatório.");
      return;
    }
    setProductLoading(true);
    setProductError(null);
    try {
      // Upload all images in parallel
      const filesToUpload = imageEntries.filter((e) => !!e.file).map((e) => e.file!);
      const uploadedUrls = await Promise.all(filesToUpload.map((f) => uploadProductImage(f)));

      // First URL = primary image_url; rest go to product_images
      const primaryUrl = uploadedUrls[0] ?? undefined;
      const extraUrls = uploadedUrls.slice(1);

      const product = await adminCreateProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category_id: productForm.category_id,
        subcategory_id: productForm.subcategory_id || undefined,
        price: productForm.price ? parseFloat(productForm.price) : 0,
        image_url: primaryUrl,
        featured: productForm.featured,
        featured_order: productForm.featured && productForm.featured_order
          ? parseInt(productForm.featured_order)
          : null,
      });

      // Save extra images to product_images table
      if (extraUrls.length > 0) {
        await adminAddProductImages(product.id, extraUrls).catch(() => {});
      }

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

      {/* Step 1 */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
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
            {/* Multi-image upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Imagens do produto
                {imageEntries.length > 0 && (
                  <span className="ml-2 font-normal text-gray-400 normal-case">
                    ({imageEntries.length} selecionada{imageEntries.length > 1 ? "s" : ""} · 1ª será a capa)
                  </span>
                )}
              </label>
              <MultiImageUpload
                entries={imageEntries}
                onAddFiles={handleAddFiles}
                onRemove={handleRemove}
                disabled={productLoading}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Nome *</label>
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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Descrição</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o produto, materiais, diferenciais..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Categoria</label>
                <select
                  value={productForm.category_id}
                  onChange={(e) => setProductForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: "" }))}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Subcategoria</label>
                <select
                  value={productForm.subcategory_id}
                  onChange={(e) => setProductForm((f) => ({ ...f, subcategory_id: e.target.value }))}
                  disabled={!productForm.category_id || subcategories.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {!productForm.category_id
                      ? "Selecione uma categoria"
                      : subcategories.length === 0
                      ? "Sem subcategorias"
                      : "Selecione..."}
                  </option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Preço base (R$)</label>
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

            {/* Featured */}
            <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 accent-black"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Produto em destaque</p>
                  <p className="text-xs text-gray-400">Aparece na seção &quot;Destaques&quot; da home</p>
                </div>
              </label>
              {productForm.featured && (
                <div className="mt-3 pl-7">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                    Ordem (opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.featured_order}
                    onChange={(e) => setProductForm((f) => ({ ...f, featured_order: e.target.value }))}
                    placeholder="Ex: 1 (menor = aparece primeiro)"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                  />
                </div>
              )}
            </div>

            {productError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{productError}</div>
            )}

            <button
              type="submit"
              disabled={productLoading}
              className="w-full bg-black text-white text-sm font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {productLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {imageEntries.length > 0 ? "Enviando imagens..." : "Salvando..."}
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
            <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
            Variantes
            <span className="ml-auto text-xs text-gray-400 font-normal">{variants.length} variante(s)</span>
          </h2>

          {variants.length > 0 && (
            <div className="mb-5 space-y-2">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{formatPrice(v.price)} · Estoque: {v.stock}</p>
                  </div>
                  <button onClick={() => handleDeleteVariant(v.id)} className="text-gray-300 hover:text-red-500 transition-colors ml-3">
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Nome *</label>
                <input type="text" value={variantForm.name} onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex: Preto M, 100ml" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Preço (R$) *</label>
                <input type="number" min="0" step="0.01" value={variantForm.price} onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))} placeholder="0,00" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Estoque</label>
                <input type="number" min="0" value={variantForm.stock} onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))} placeholder="0" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
            </div>

            {variantError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{variantError}</div>
            )}

            <div className="flex items-center gap-3">
              <button type="submit" disabled={variantLoading} className="flex items-center gap-2 border border-black text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black hover:text-white transition-colors disabled:opacity-60">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {variantLoading ? "Adicionando..." : "Adicionar variante"}
              </button>
              <button type="button" onClick={() => router.push("/admin/products")} className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                Concluir
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
