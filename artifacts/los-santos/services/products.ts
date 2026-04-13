import { supabase } from "@/lib/supabase";
import type { Product, ProductVariant } from "@/types";

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
