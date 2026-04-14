import { supabase } from "@/lib/supabase";
import type { Order, OrderItem } from "@/types";

/** Mensagem legível para o usuário (checkout / UI). */
export function formatOrderError(error: unknown): string {
  const err = error as { message?: string; code?: string };
  const raw = (err.message ?? "").trim();
  const code = err.code ?? "";

  if (code === "42703" || /column .* does not exist/i.test(raw)) {
    return "Não foi possível registrar o pedido: configuração do servidor incompleta. Avise a loja ou tente mais tarde.";
  }
  if (/row-level security|RLS|permission denied|violates row-level security/i.test(raw)) {
    return "Não foi possível salvar o pedido. Verifique sua conexão e tente novamente.";
  }
  if (
    code === "23503" ||
    /foreign key|violates foreign key constraint/i.test(raw)
  ) {
    return "Um item do carrinho não está mais disponível. Atualize a página e tente de novo.";
  }
  if (raw.length > 0 && raw.length < 220) {
    return raw;
  }
  return "Não foi possível finalizar o pedido. Tente novamente em instantes.";
}

export async function createOrder(
  order: Omit<Order, "id" | "status" | "created_at">,
  items: Omit<OrderItem, "order_id">[]
): Promise<string> {
  const customer_name = order.customer_name.trim();
  const customer_phone = order.customer_phone.trim();

  if (!customer_name || !customer_phone) {
    throw new Error("Informe nome e telefone para finalizar o pedido.");
  }

  if (items.length === 0) {
    throw new Error("Seu carrinho está vazio.");
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name,
      customer_phone,
      total: order.total,
      delivery_type: order.delivery_type,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderError) {
    throw new Error(formatOrderError(orderError));
  }

  if (!orderData?.id) {
    throw new Error("Resposta inválida ao criar o pedido. Tente novamente.");
  }

  const orderId = orderData.id as string;

  const orderItems = items.map((item) => {
    const variantId =
      item.variant_id !== null && item.variant_id === item.product_id
        ? null
        : item.variant_id;
    return {
      order_id: orderId,
      product_id: item.product_id,
      variant_id: variantId,
      quantity: item.quantity,
      price: item.price,
    };
  });

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw new Error(formatOrderError(itemsError));
  }

  return orderId;
}
