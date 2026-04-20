import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-browser";
import type { Category, Product, ProductImage, ProductVariant, Subcategory } from "@/types";

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: string;
  total: number;
  status: string;
  created_at: string;
  order_items?: AdminOrderItem[];
}

export interface AdminOrderItem {
  id?: string;
  product_name?: string | null;
  variant_name?: string | null;
  quantity: number;
  price: number;
}

interface RawOrderItem {
  id?: string;
  quantity: number;
  price: number;
  product_variants?: {
    name: string;
    products?: { name: string } | null;
  } | null;
}

export interface CreateProductInput {
  name: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  price?: number;
  stock?: number;
  image_url?: string;
  featured?: boolean;
  featured_order?: number | null;
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

export async function getSubcategories(categoryId: string): Promise<Subcategory[]> {
  const { data, error } = await supabase
    .from("subcategories")
    .select("id, name, category_id")
    .eq("category_id", categoryId)
    .order("name", { ascending: true });
  if (error) {
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }
  return (data ?? []) as Subcategory[];
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
    .select("*, categories(id, name), subcategories(id, name, category_id)")
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
      subcategory_id: input.subcategory_id || null,
      price: input.price ?? 0,
      stock: input.stock ?? 99,
      image_url: input.image_url || null,
      featured: input.featured ?? false,
      featured_order: input.featured_order ?? null,
    })
    .select("*, categories(id, name), subcategories(id, name, category_id)")
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

export async function adminDeleteProduct(productId: string): Promise<void> {
  const deleteImages = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteImages.error && deleteImages.error.code !== "42P01") {
    throw new Error(deleteImages.error.message);
  }

  const deleteVariants = await supabase
    .from("product_variants")
    .delete()
    .eq("product_id", productId);

  if (deleteVariants.error) {
    throw new Error(deleteVariants.error.message);
  }

  const deleteProduct = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteProduct.error) {
    if (deleteProduct.error.code === "23503") {
      throw new Error(
        "Esse produto já está vinculado a pedidos e não pode ser excluído agora."
      );
    }
    throw new Error(deleteProduct.error.message);
  }
}

export async function adminGetOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        quantity,
        price,
        product_variants!product_variant_id(
          name,
          products(name)
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((order) => ({
    ...order,
    order_items: ((order.order_items ?? []) as RawOrderItem[]).map((item) => ({
      id: item.id,
      product_name: item.product_variants?.products?.name ?? null,
      variant_name: item.product_variants?.name ?? null,
      quantity: item.quantity,
      price: item.price,
    })),
  }));
}

export async function adminGetProductImages(
  productId: string
): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) {
    // Table may not exist yet
    if (error.code === "42P01") return [];
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function adminAddProductImages(
  productId: string,
  urls: string[]
): Promise<ProductImage[]> {
  if (urls.length === 0) return [];
  const { data, error } = await supabase
    .from("product_images")
    .insert(urls.map((image_url) => ({ product_id: productId, image_url })))
    .select();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function adminDeleteProductImage(imageId: string): Promise<void> {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw new Error(error.message);
}

export async function adminUpdateProduct(
  productId: string,
  input: {
    name: string;
    description: string;
    price: number;
    stock?: number;
    category_id?: string | null;
    subcategory_id?: string | null;
    featured?: boolean;
    featured_order?: number | null;
  }
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.category_id !== undefined && { category_id: input.category_id || null }),
      ...(input.subcategory_id !== undefined && { subcategory_id: input.subcategory_id || null }),
      ...(input.featured !== undefined && { featured: input.featured }),
      ...(input.featured_order !== undefined && { featured_order: input.featured_order }),
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);
}

export async function adminUpdateProductPrimaryImage(
  productId: string,
  imageUrl: string | null
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ image_url: imageUrl })
    .eq("id", productId);
  if (error) throw new Error(error.message);
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

export async function adminDeleteOrder(orderId: string): Promise<void> {
  const { error: itemsError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);

  if (itemsError) throw new Error(itemsError.message);

  const { data, error } = await supabase
    .from("orders")
    .delete()
    .eq("id", orderId)
    .select("id");

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    throw new Error("Não foi possível excluir o pedido. Verifique as permissões no Supabase (política DELETE ausente).");
  }
}
