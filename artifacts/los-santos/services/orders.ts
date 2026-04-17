import { supabase } from "@/lib/supabase";
import type { Order, OrderItem } from "@/types";

function getMissingSchemaColumn(error: unknown): string | null {
  const err = error as { message?: string; code?: string };
  const raw = (err.message ?? "").trim();

  if (err.code !== "PGRST204") return null;

  const match = raw.match(/could not find the '([^']+)' column/i);
  return match?.[1] ?? null;
}

async function insertOrder(originalPayload: {
  customer_name: string;
  customer_phone: string;
  total: number;
  delivery_type: string;
  status: string;
}) {
  let payload = { ...originalPayload } as Record<string, unknown>;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await supabase
      .from("orders")
      .insert(payload)
      .select("id")
      .single();

    if (!result.error) return result;

    const missingColumn = getMissingSchemaColumn(result.error);
    if (!missingColumn) return result;

    const next = { ...payload };
    delete next[missingColumn];
    payload = next;
  }

  return await supabase.from("orders").insert(payload).select("id").single();
}

async function insertOrderItems(
  originalOrderItems: Array<{
    order_id: string;
    product_id: string;
    product_name?: string | null;
    variant_id: string | null;
    variant_name?: string | null;
    quantity: number;
    price: number;
  }>
) {
  let orderItems = [...originalOrderItems];

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const result = await supabase.from("order_items").insert(orderItems);
    if (!result.error) return result;

    const missingColumn = getMissingSchemaColumn(result.error);
    if (!missingColumn) return result;

    orderItems = orderItems.map((item) => {
      const next = { ...item } as Record<string, unknown>;
      delete next[missingColumn];
      return next as typeof orderItems[number];
    });
  }

  return await supabase.from("order_items").insert(orderItems);
}

async function prepareStockUpdates(items: Omit<OrderItem, "order_id">[]) {
  const variantIds = Array.from(
    new Set(items.map((item) => item.variant_id).filter((id): id is string => Boolean(id)))
  );

  if (variantIds.length === 0) return [];

  const { data, error } = await supabase
    .from("product_variants")
    .select("id, stock")
    .in("id", variantIds);

  if (error) {
    throw new Error("Não foi possível verificar o estoque antes de finalizar o pedido.");
  }

  const stockByVariantId = new Map(
    (data ?? []).map((row) => [row.id as string, Number(row.stock ?? 0)])
  );

  const quantityByVariantId = new Map<string, number>();
  for (const item of items) {
    if (!item.variant_id) continue;
    quantityByVariantId.set(
      item.variant_id,
      (quantityByVariantId.get(item.variant_id) ?? 0) + item.quantity
    );
  }

  return Array.from(quantityByVariantId.entries()).map(([variantId, quantity]) => {
    const currentStock = stockByVariantId.get(variantId);

    if (currentStock === undefined) {
      throw new Error("Uma variação do carrinho não foi encontrada. Atualize a página e tente de novo.");
    }

    if (currentStock < quantity) {
      throw new Error("Uma variação do carrinho não tem estoque suficiente para esse pedido.");
    }

    return {
      variantId,
      currentStock,
      nextStock: currentStock - quantity,
    };
  });
}

async function applyStockUpdates(
  updates: Array<{ variantId: string; currentStock: number; nextStock: number }>
) {
  const applied: Array<{ variantId: string; previousStock: number }> = [];

  try {
    for (const update of updates) {
      const { data, error } = await supabase
        .from("product_variants")
        .update({ stock: update.nextStock })
        .eq("id", update.variantId)
        .eq("stock", update.currentStock)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        throw new Error("O estoque mudou enquanto o pedido era finalizado. Atualize a página e tente novamente.");
      }

      applied.push({ variantId: update.variantId, previousStock: update.currentStock });
    }
  } catch (error) {
    await Promise.all(
      applied.map((item) =>
        supabase
          .from("product_variants")
          .update({ stock: item.previousStock })
          .eq("id", item.variantId)
      )
    );
    throw error;
  }
}

/** Mensagem legível para o usuário (checkout / UI). */
export function formatOrderError(error: unknown): string {
  const err = error as { message?: string; code?: string };
  const raw = (err.message ?? "").trim();
  const code = err.code ?? "";

  if (
    code === "42703" ||
    code === "PGRST204" ||
    /column .* does not exist/i.test(raw) ||
    /could not find the .* column/i.test(raw)
  ) {
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

  const stockUpdates = await prepareStockUpdates(items);

  const { data: orderData, error: orderError } = await insertOrder({
    customer_name,
    customer_phone,
    total: order.total,
    delivery_type: order.delivery_type,
    status: "pending",
  });

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

    const variantName =
      variantId === null || item.variant_name === "Padrão"
        ? null
        : item.variant_name ?? null;

    return {
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name?.trim() || null,
      variant_id: variantId,
      variant_name: variantName,
      quantity: item.quantity,
      price: item.price,
    };
  });

  const { error: itemsError } = await insertOrderItems(orderItems);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw new Error(formatOrderError(itemsError));
  }

  try {
    await applyStockUpdates(stockUpdates);
  } catch (error) {
    await supabase.from("orders").delete().eq("id", orderId);
    throw error;
  }

  return orderId;
}
