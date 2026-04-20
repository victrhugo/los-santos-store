import { isSupabaseConfigured } from "@/lib/supabase";
import { getProducts, getCategoriesWithSeed, getFeaturedProducts } from "@/services/products";
import { getStoreSettings } from "@/services/settings";
import HomeClient from "@/components/HomeClient";
import type { Category, Product, StoreSettings } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 rounded-lg inline-block max-w-md">
          <p className="font-medium mb-1">Supabase não configurado</p>
          <p className="text-amber-800/90">
            Defina <code className="text-xs bg-amber-100/80 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
            <code className="text-xs bg-amber-100/80 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no painel da
            Vercel (Settings → Environment Variables) e faça um novo deploy.
          </p>
        </div>
      </div>
    );
  }

  let products: Product[] = [];
  let categories: Category[] = [];
  let featuredProducts: Product[] = [];
  let settings: StoreSettings | null = null;
  let error: string | null = null;

  try {
    [products, categories, featuredProducts, settings] = await Promise.all([
      getProducts(),
      getCategoriesWithSeed(),
      getFeaturedProducts(),
      getStoreSettings(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar dados";
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <HomeClient
      products={products}
      categories={categories}
      featuredProducts={featuredProducts}
      settings={settings}
    />
  );
}
