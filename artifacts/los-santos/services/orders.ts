import { supabase } from "@/lib/supabase";
import type { Order, OrderItem } from "@/types";

export async function createOrder(
  order: Omit<Order, "id" | "status" | "created_at">,
  items: Omit<OrderItem, "order_id">[]
): Promise<string> {
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      delivery_type: order.delivery_type,
      total: order.total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError) throw new Error(orderError.message);

  const orderId = orderData.id as string;

  const orderItems = items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw new Error(itemsError.message);

  return orderId;
}
