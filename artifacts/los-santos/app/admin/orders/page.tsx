"use client";

import { useEffect, useState } from "react";
import {
  adminDeleteOrder,
  adminGetOrders,
  adminUpdateOrderStatus,
} from "@/services/admin";
import type { AdminOrder } from "@/services/admin";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  ready: { label: "Pronto", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-600" },
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "ready", label: "Pronto" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDeleteOrder(order: AdminOrder) {
    const confirmed = window.confirm(
      `Excluir o pedido de "${order.customer_name}"? Essa ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setDeletingId(order.id);
    setError(null);

    try {
      await adminDeleteOrder(order.id);
      setOrders((prev) => prev.filter((item) => item.id !== order.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir pedido.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-black">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {loading ? "..." : `${orders.length} pedido(s)`}
        </p>
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

      {!loading && orders.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="text-gray-300 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Nenhum pedido ainda</p>
          <p className="text-sm text-gray-400 mt-1">
            Os pedidos dos clientes aparecerão aqui.
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] ?? {
              label: order.status,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        {order.customer_name}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span>{order.customer_phone}</span>
                      <span>
                        {DELIVERY_LABELS[order.delivery_type] ?? order.delivery_type}
                      </span>
                      <span>{formatDate(order.created_at)}</span>
                      <span className="font-medium text-gray-700">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={order.status}
                      disabled={updating === order.id || deletingId === order.id}
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
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order)}
                      disabled={deletingId === order.id}
                      className="text-xs font-medium text-red-600 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {deletingId === order.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mt-3">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
