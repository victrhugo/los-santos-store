import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-browser";
import type { Category, Product, ProductVariant } from "@/types";

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  total: number;
  status: string;
  created_at: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  category_id: string;
  price?: number;
  image_url?: string;
}

export interface CreateVariantInput {
  product_id: string;
  name: string;
  price: number;
  stock: number;
}

export async function uploadProductImage(file: File): Promise<string> {
  const client = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await client.storage
    .from("product-images")
    .upload(fileName, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from("product-images").getPublicUrl(fileName);
  return data.publicUrl;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);

  // Deduplicate by name (case-insensitive) — keep first occurrence
  const seen = new Set<string>();
  return (data ?? []).filter((c) => {
    const key = c.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }) as Category[];
}

export async function adminGetProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function adminCreateProduct(
  input: CreateProductInput
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      description: input.description || null,
      category_id: input.category_id || null,
      price: input.price ?? 0,
      image_url: input.image_url || null,
    })
    .select("*, categories(id, name)")
    .single();
  if (error) throw new Error(error.message);
  return data as Product;
}

export async function adminCreateVariant(
  input: CreateVariantInput
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: input.product_id,
      name: input.name,
      price: input.price,
      stock: input.stock,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProductVariant;
}

export async function adminGetVariants(
  productId: string
): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminDeleteVariant(variantId: string): Promise<void> {
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);
  if (error) throw new Error(error.message);
}

export async function adminGetOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
}
