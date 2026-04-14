export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  categories: Category | null;
  created_at: string;
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
