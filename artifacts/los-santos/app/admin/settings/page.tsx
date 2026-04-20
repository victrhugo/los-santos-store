"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { adminGetStoreSettings, adminUpdateStoreSettings } from "@/services/settings";
import { uploadProductImage } from "@/services/admin";
import type { StoreSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminGetStoreSettings()
      .then((s) => {
        setSettings(s);
        setTitle(s?.hero_title ?? "");
        setSubtitle(s?.hero_subtitle ?? "");
        setImageUrl(s?.hero_image_url ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  }

  function clearImage() {
    setImageFile(null);
    setImageUrl("");
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      let finalImageUrl: string | null = imageUrl || null;

      if (imageFile) {
        finalImageUrl = await uploadProductImage(imageFile);
        setImageUrl(finalImageUrl);
        setImageFile(null);
        if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      await adminUpdateStoreSettings({
        hero_title: title.trim(),
        hero_subtitle: subtitle.trim(),
        hero_image_url: finalImageUrl,
      });

      setSettings((s) =>
        s
          ? { ...s, hero_title: title.trim(), hero_subtitle: subtitle.trim(), hero_image_url: finalImageUrl }
          : s
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const currentImage = imagePreview ?? (imageUrl || null);

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">Configurações da loja</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edite o conteúdo exibido no hero da página inicial</p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 pb-1 border-b border-gray-100">Hero da home</h2>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Los Santos Store"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Subtítulo
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Ex: Roupas, acessórios e perfumes com estilo."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
          />
        </div>

        {/* Hero image */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Imagem de fundo (opcional)
          </label>

          {currentImage ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-50 mb-3" style={{ aspectRatio: "16/6" }}>
              <Image
                src={currentImage}
                alt="Preview do hero"
                fill
                className="object-cover"
                sizes="600px"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                aria-label="Remover imagem"
              >
                <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-white">
              <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-400">Clique para selecionar uma imagem</span>
              <span className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP — recomendado 1920×600px</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {!currentImage && (
            <p className="text-xs text-gray-400 mt-1.5">
              Sem imagem: o fundo preto padrão com efeitos é exibido.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar configurações"
            )}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Salvo com sucesso
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
