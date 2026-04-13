import { supabase } from "@/lib/supabase";
import type { Category, Product, ProductVariant } from "@/types";

const DEFAULT_CATEGORIES = ["Roupas", "Óculos", "Perfumes", "Acessórios"];

export async function getCategoriesWithSeed(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    console.log("[categories] fetched from DB:", data);

    if (data && data.length > 0) {
      // Deduplicate by name (keep first occurrence of each name)
      const seen = new Set<string>();
      const unique = (data as Category[]).filter((c) => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });
      return unique;
    }

    // Table is empty — seed default categories
    console.log("[categories] table is empty, seeding defaults...");
    const { data: inserted, error: insertError } = await supabase
      .from("categories")
      .insert(DEFAULT_CATEGORIES.map((name) => ({ name })))
      .select("id, name");

    if (insertError) {
      console.error("[categories] seed failed:", insertError.message);
      return [];
    }

    console.log("[categories] seeded:", inserted);
    return (inserted ?? []) as Category[];
  } catch (e) {
    console.error("[categories] error:", e);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("price", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
