"use client";

import { useEffect, useState } from "react";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
} from "@/services/admin";
import type { AdminOrder, AdminOrderItem } from "@/services/admin";
import { formatDateBR } from "@/lib/dateUtils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}


function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

function whatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function formatOrderItemLabel(item: AdminOrderItem) {
  const product = item.product_name?.trim() || "Produto";
  const variant = item.variant_name?.trim();
  return variant ? `${product} · ${variant}` : product;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pendente",   color: "bg-yellow-100 text-yellow-700" },
  completed: { label: "Finalizado", color: "bg-green-100 text-green-700"  },
  cancelled: { label: "Cancelado",  color: "bg-red-100 text-red-600"      },
  // legados
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700"   },
  ready:     { label: "Pronto",     color: "bg-purple-100 text-purple-700"},
  delivered: { label: "Entregue",   color: "bg-green-100 text-green-700"  },
};

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pendente"   },
  { value: "completed", label: "Finalizado" },
  { value: "cancelled", label: "Cancelado"  },
];

const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Retirada",
  uber: "Uber",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  useEffect(() => {
    adminGetOrders()
      .then(setOrders)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdating(orderId);
    try {
      await adminUpdateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  }

  const visibleOrders = showCancelled
    ? orders
    : orders.filter((o) => o.status !== "cancelled");

  const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-black">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? "..." : `${visibleOrders.length} pedido(s) ativo(s)`}
          </p>
        </div>
        {!loading && cancelledCount > 0 && (
          <button
            onClick={() => setShowCancelled((v) => !v)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              showCancelled
                ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {showCancelled
              ? `Ocultar cancelados (${cancelledCount})`
              : `Ver cancelados (${cancelledCount})`}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
      )}

      {!loading && visibleOrders.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          {cancelledCount > 0 ? (
            <>
              <p className="text-gray-500 font-medium">Nenhum pedido ativo</p>
              <p className="text-sm text-gray-400 mt-1">
                {cancelledCount} pedido(s) cancelado(s) oculto(s).
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">Nenhum pedido ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Os pedidos dos clientes aparecerão aqui.
              </p>
            </>
          )}
        </div>
      )}

      {!loading && visibleOrders.length > 0 && (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? {
              label: order.status,
              color: "bg-gray-100 text-gray-600",
            };
            const isCancelled = order.status === "cancelled";

            return (
              <div
                key={order.id}
                className={`bg-white border border-gray-100 rounded-xl p-5 transition-opacity ${
                  isCancelled ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        {order.customer_name}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Contato</p>
                        <p className="font-semibold text-gray-900 text-sm">
                          {formatPhone(order.customer_phone)}
                        </p>
                        {whatsAppUrl(order.customer_phone, `Olá, estou entrando em contato sobre seu pedido #${order.id.slice(0, 8).toUpperCase()}`) && (
                          <a
                            href={whatsAppUrl(order.customer_phone, `Olá, estou entrando em contato sobre seu pedido #${order.id.slice(0, 8).toUpperCase()}`)!}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition-colors"
                          >
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Chamar no WhatsApp
                          </a>
                        )}
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Entrega</p>
                        <p className="font-medium text-gray-800">
                          {DELIVERY_LABELS[order.delivery_type] ?? order.delivery_type}
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Data</p>
                        <p className="font-medium text-gray-800">{formatDateBR(order.created_at)}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">Total</p>
                        <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={order.status}
                      disabled={updating === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className="text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black transition-colors bg-white disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                      {/* Renderiza opção do status atual se for legado */}
                      {!STATUS_OPTIONS.some((s) => s.value === order.status) && (
                        <option value={order.status}>
                          {STATUS_LABELS[order.status]?.label ?? order.status}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Itens do pedido
                    </p>
                    <p className="text-xs text-gray-300">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  {order.order_items && order.order_items.length > 0 ? (
                    <div className="space-y-2">
                      {order.order_items.map((item, index) => (
                        <div
                          key={item.id ?? `${order.id}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {formatOrderItemLabel(item)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.quantity} x {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.quantity * item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-sm text-gray-400">
                      Esse pedido não tem detalhes de itens salvos para exibição.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
