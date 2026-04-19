"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  adminUpdateProduct,
  adminCreateVariant,
  adminDeleteVariant,
  adminGetVariants,
  adminGetProductImages,
  adminAddProductImages,
  adminDeleteProductImage,
  adminUpdateProductPrimaryImage,
  uploadProductImage,
  getCategories,
  getSubcategories,
} from "@/services/admin";
import { getProductById } from "@/services/products";
import { MultiImageUpload, type ImageEntry } from "@/components/MultiImageUpload";
import type { Category, Product, ProductImage, ProductVariant, Subcategory } from "@/types";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function EditProductPage() {
  const params = useParams();
  const productId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [dbImages, setDbImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Categories / subcategories for the info form
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // Product info edit form
  const [infoName, setInfoName] = useState("");
  const [infoDescription, setInfoDescription] = useState("");
  const [infoPrice, setInfoPrice] = useState("");
  const [infoCategoryId, setInfoCategoryId] = useState("");
  const [infoSubcategoryId, setInfoSubcategoryId] = useState("");
  const [infoFeatured, setInfoFeatured] = useState(false);
  const [infoFeaturedOrder, setInfoFeaturedOrder] = useState("");
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [variantForm, setVariantForm] = useState({ name: "", price: "", stock: "" });
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);

  const [newImageEntries, setNewImageEntries] = useState<ImageEntry[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoadError("ID do produto não encontrado na URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);

    Promise.all([
      getProductById(productId),
      adminGetVariants(productId),
      adminGetProductImages(productId),
      getCategories(),
    ])
      .then(([{ product: p, error: prodError }, v, imgs, cats]) => {
        if (prodError) setLoadError(prodError);
        setProduct(p);
        setVariants(v);
        setDbImages(imgs);
        setCategories(cats);
        if (p) {
          setInfoName(p.name);
          setInfoDescription(p.description ?? "");
          setInfoPrice(String(p.price));
          setInfoCategoryId(p.category_id ?? "");
          setInfoSubcategoryId(p.subcategory_id ?? "");
          setInfoFeatured(p.featured ?? false);
          setInfoFeaturedOrder(p.featured_order != null ? String(p.featured_order) : "");
        }
      })
      .catch((e) => {
        setLoadError(e instanceof Error ? e.message : "Erro inesperado.");
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // Load subcategories whenever the selected category changes
  useEffect(() => {
    if (!infoCategoryId) {
      setSubcategories([]);
      return;
    }
    getSubcategories(infoCategoryId)
      .then(setSubcategories)
      .catch(() => setSubcategories([]));
  }, [infoCategoryId]);

  /* ── Product info ─────────────────────────────────────── */
  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    const trimmedName = infoName.trim();
    if (!trimmedName) {
      setInfoError("O nome do produto é obrigatório.");
      return;
    }
    const parsedPrice = parseFloat(infoPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setInfoError("Informe um preço válido.");
      return;
    }
    setInfoSaving(true);
    setInfoError(null);
    setInfoSaved(false);
    try {
      const parsedOrder = infoFeaturedOrder.trim()
        ? parseInt(infoFeaturedOrder.trim())
        : null;
      await adminUpdateProduct(productId, {
        name: trimmedName,
        description: infoDescription.trim(),
        price: parsedPrice,
        category_id: infoCategoryId || null,
        subcategory_id: infoSubcategoryId || null,
        featured: infoFeatured,
        featured_order: infoFeatured ? parsedOrder : null,
      });
      setProduct((p) =>
        p
          ? {
              ...p,
              name: trimmedName,
              description: infoDescription.trim(),
              price: parsedPrice,
              category_id: infoCategoryId || null,
              subcategory_id: infoSubcategoryId || null,
              featured: infoFeatured,
              featured_order: infoFeatured ? (infoFeaturedOrder.trim() ? parseInt(infoFeaturedOrder.trim()) : null) : null,
            }
          : p
      );
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } catch (e) {
      setInfoError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setInfoSaving(false);
    }
  }

  /* ── Variants ─────────────────────────────────────────── */
  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) return;
    if (!variantForm.name.trim() || !variantForm.price) {
      setVariantError("Nome e preço são obrigatórios.");
      return;
    }
    setVariantLoading(true);
    setVariantError(null);
    try {
      const variant = await adminCreateVariant({
        product_id: productId,
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

  /* ── Images ───────────────────────────────────────────── */
  const handleAddFiles = useCallback((files: File[]) => {
    const newEntries: ImageEntry[] = files.map((file) => ({
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      preview: URL.createObjectURL(file),
      file,
    }));
    setNewImageEntries((prev) => [...prev, ...newEntries]);
  }, []);

  const handleRemoveNewEntry = useCallback((key: string) => {
    setNewImageEntries((prev) => {
      const entry = prev.find((e) => e.key === key);
      if (entry?.preview.startsWith("blob:")) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.key !== key);
    });
  }, []);

  async function handleUploadImages() {
    if (!productId || newImageEntries.length === 0) return;
    setImageUploading(true);
    setImageError(null);
    try {
      const files = newImageEntries.filter((e) => !!e.file).map((e) => e.file!);
      const urls = await Promise.all(files.map((f) => uploadProductImage(f)));
      const saved = await adminAddProductImages(productId, urls);
      setDbImages((prev) => [...prev, ...saved]);
      setNewImageEntries([]);
    } catch (e) {
      setImageError(e instanceof Error ? e.message : "Erro ao enviar imagens.");
    } finally {
      setImageUploading(false);
    }
  }

  async function handleDeleteDbImage(img: ProductImage) {
    if (!productId || !product) return;
    const isPrimary = img.image_url === product.image_url;
    await adminDeleteProductImage(img.id);
    const remaining = dbImages.filter((i) => i.id !== img.id);
    setDbImages(remaining);

    if (isPrimary) {
      // Promote next image as primary, or clear it
      const next = remaining[0]?.image_url ?? null;
      await adminUpdateProductPrimaryImage(productId, next);
      setProduct((p) => p ? { ...p, image_url: next } : p);
    }
  }

  async function handleDeletePrimaryImage() {
    if (!productId || !product?.image_url) return;
    // If the primary URL is also a dbImage, delegate to handleDeleteDbImage
    const matchingDbImg = dbImages.find((i) => i.image_url === product.image_url);
    if (matchingDbImg) {
      await handleDeleteDbImage(matchingDbImg);
      return;
    }
    // Primary image is only in products.image_url (not in product_images)
    const next = dbImages[0]?.image_url ?? null;
    await adminUpdateProductPrimaryImage(productId, next);
    setProduct((p) => p ? { ...p, image_url: next } : p);
  }

  /* ── Render ───────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="text-center py-16">
        {loadError ? (
          <>
            <p className="text-red-500 font-semibold mb-1">Erro ao carregar produto</p>
            <p className="text-sm text-gray-400 mb-4">{loadError}</p>
          </>
        ) : (
          <>
            <p className="text-gray-600 font-semibold mb-1">Produto não encontrado</p>
            <p className="text-sm text-gray-400 mb-4">
              ID: <code className="bg-gray-100 px-1 rounded text-xs">{productId ?? "indefinido"}</code>
            </p>
          </>
        )}
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-white bg-black px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          ← Voltar para produtos
        </Link>
      </div>
    );
  }

  // Build the full image list visible in the editor
  // primary first (if exists and not already in dbImages), then dbImages
  const primaryIsInDb = dbImages.some((i) => i.image_url === product.image_url);
  const allDisplayImages: { src: string; dbImg?: ProductImage; isPrimary: boolean }[] = [];
  if (product.image_url && !primaryIsInDb) {
    allDisplayImages.push({ src: product.image_url, isPrimary: true });
  }
  for (const img of dbImages) {
    allDisplayImages.push({
      src: img.image_url,
      dbImg: img,
      isPrimary: img.image_url === product.image_url,
    });
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

      {/* ── Product info section ───────────────────────── */}
      <form onSubmit={handleSaveInfo} className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Informações do produto</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Nome *
            </label>
            <input
              type="text"
              value={infoName}
              onChange={(e) => setInfoName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="Nome do produto"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Descrição
            </label>
            <textarea
              value={infoDescription}
              onChange={(e) => setInfoDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none"
              placeholder="Descrição do produto"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              Preço base (R$)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={infoPrice}
              onChange={(e) => setInfoPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
              placeholder="0,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Categoria
              </label>
              <select
                value={infoCategoryId}
                onChange={(e) => {
                  setInfoCategoryId(e.target.value);
                  setInfoSubcategoryId("");
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white"
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Subcategoria
              </label>
              <select
                value={infoSubcategoryId}
                onChange={(e) => setInfoSubcategoryId(e.target.value)}
                disabled={!infoCategoryId || subcategories.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {!infoCategoryId
                    ? "Selecione uma categoria"
                    : subcategories.length === 0
                    ? "Sem subcategorias"
                    : "Sem subcategoria"}
                </option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured */}
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={infoFeatured}
                onChange={(e) => setInfoFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 accent-black"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Produto em destaque</p>
                <p className="text-xs text-gray-400">Aparece na seção &quot;Destaques&quot; da home</p>
              </div>
            </label>
            {infoFeatured && (
              <div className="mt-3 pl-7">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Ordem (opcional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={infoFeaturedOrder}
                  onChange={(e) => setInfoFeaturedOrder(e.target.value)}
                  placeholder="Ex: 1 (menor = aparece primeiro)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {infoError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {infoError}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={infoSaving}
            className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {infoSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
          {infoSaved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Salvo com sucesso
            </span>
          )}
        </div>
      </form>

      {/* ── Images section ─────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          Imagens
          <span className="ml-auto text-xs font-normal text-gray-400">
            {allDisplayImages.length} imagem(ns)
          </span>
        </h2>

        {/* Existing images grid */}
        {allDisplayImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {allDisplayImages.map(({ src, dbImg, isPrimary }, idx) => (
              <div key={idx} className="relative group aspect-square">
                <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
                  <Image
                    src={src}
                    alt={`Imagem ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                {isPrimary && (
                  <span className="absolute top-1 left-1 text-[10px] font-semibold bg-black text-white px-1.5 py-0.5 rounded">
                    Capa
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    dbImg ? handleDeleteDbImage(dbImg) : handleDeletePrimaryImage()
                  }
                  className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  aria-label="Remover imagem"
                >
                  <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New images queue */}
        <MultiImageUpload
          entries={newImageEntries}
          onAddFiles={handleAddFiles}
          onRemove={handleRemoveNewEntry}
          disabled={imageUploading}
          showFirstAsPrimary={false}
        />

        {imageError && (
          <p className="text-red-500 text-sm mt-2">{imageError}</p>
        )}

        {newImageEntries.length > 0 && (
          <button
            type="button"
            onClick={handleUploadImages}
            disabled={imageUploading}
            className="mt-3 flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {imageUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Salvar {newImageEntries.length} imagem(ns)
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Variants section ───────────────────────────── */}
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
                onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
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
