import { supabase } from "@/lib/supabase";
import type { Category, Product, ProductVariant } from "@/types";

const DEFAULT_CATEGORIES = ["Roupas", "Óculos", "Perfumes", "Acessórios"];

/** Remove duplicate rows from DB keeping only the first ID per name. */
async function removeDuplicatesFromDB(all: Category[]): Promise<Category[]> {
  const seen = new Map<string, Category>();
  const duplicateIds: string[] = [];

  for (const cat of all) {
    const key = cat.name.toLowerCase();
    if (seen.has(key)) {
      duplicateIds.push(cat.id);
    } else {
      seen.set(key, cat);
    }
  }

  if (duplicateIds.length > 0) {
    console.log("[categories] removing duplicate IDs from DB:", duplicateIds);
    await supabase.from("categories").delete().in("id", duplicateIds);
  }

  return Array.from(seen.values());
}

export async function getCategoriesWithSeed(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);

    const all = (data ?? []) as Category[];
    console.log("[categories] fetched from DB:", all);

    if (all.length > 0) {
      // Clean any duplicates left in the DB, then return unique list
      return await removeDuplicatesFromDB(all);
    }

    // Table is empty — seed only the missing default categories
    console.log("[categories] table is empty, seeding defaults...");
    const { data: existing } = await supabase
      .from("categories")
      .select("name");

    const existingNames = new Set(
      (existing ?? []).map((c: { name: string }) => c.name.toLowerCase())
    );

    const toInsert = DEFAULT_CATEGORIES.filter(
      (name) => !existingNames.has(name.toLowerCase())
    );

    if (toInsert.length === 0) {
      console.log("[categories] all defaults already exist, skipping seed");
      return all;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("categories")
      .insert(toInsert.map((name) => ({ name })))
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

  console.log("[getProducts] count:", data?.length ?? 0, error ? `error: ${error.message}` : "ok");

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductById(
  id: string | undefined
): Promise<{ product: Product | null; error: string | null }> {
  console.log("[getProductById] id:", id);

  if (!id || id.trim() === "") {
    console.warn("[getProductById] called with empty id");
    return { product: null, error: "ID inválido." };
  }

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name)")
    .eq("id", id.trim())
    .single();

  console.log(
    "[getProductById] result:",
    data ? `found: ${data.name}` : "not found",
    error ? `error: ${error.message} (code: ${error.code})` : ""
  );

  if (error) {
    if (error.code === "PGRST116") {
      return { product: null, error: null };
    }
    return { product: null, error: error.message };
  }

  return { product: data as Product, error: null };
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
