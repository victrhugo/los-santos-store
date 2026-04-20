export interface Category {
  id: string;
  name: string;
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  featured: boolean;
  featured_order: number | null;
  categories: Category | null;
  subcategories: Subcategory | null;
  created_at: string;
  product_variants?: { stock: number }[];
  product_images?: { image_url: string }[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: "pickup" | "uber";
  total: number;
  status?: string;
  created_at?: string;
}

export interface StoreSettings {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  updated_at: string;
}

export interface OrderItem {
  order_id: string;
  product_id: string;
  product_name?: string;
  /** Null quando o produto não tem linha em `product_variants` (variação “Padrão” só no cliente). */
  variant_id: string | null;
  variant_name?: string | null;
  quantity: number;
  price: number;
}
