"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { createOrder, formatOrderError } from "@/services/orders";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    delivery_type: "pickup" as "pickup" | "uber",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="inline-block bg-black text-white text-sm px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderId = await createOrder(
        {
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          delivery_type: form.delivery_type,
          total,
        },
        items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          variant_id:
            item.variant.id === item.product.id ? null : item.variant.id,
          variant_name:
            item.variant.id === item.product.id ? null : item.variant.name,
          quantity: item.quantity,
          price: item.variant.price,
        }))
      );

      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      setError(formatOrderError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar ao carrinho
      </Link>

      <h1 className="text-2xl font-bold text-black mb-8">Finalizar pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Nome completo *
            </label>
            <input
              type="text"
              value={form.customer_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer_name: e.target.value }))
              }
              placeholder="Seu nome"
              required
              className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Telefone / WhatsApp *
            </label>
            <input
              type="tel"
              value={form.customer_phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, customer_phone: e.target.value }))
              }
              placeholder="(00) 00000-0000"
              required
              className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
              Tipo de entrega *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, delivery_type: "pickup" }))
                }
                className={`py-3 px-4 rounded border text-sm font-medium transition-all ${
                  form.delivery_type === "pickup"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                Retirada na loja
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, delivery_type: "uber" }))
                }
                className={`py-3 px-4 rounded border text-sm font-medium transition-all ${
                  form.delivery_type === "uber"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                Entrega via Uber
              </button>
            </div>
            {form.delivery_type === "uber" && (
              <p className="mt-2 text-xs text-gray-400">
                O frete será combinado via WhatsApp após a confirmação do pedido.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-800"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-sm font-semibold py-4 rounded hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processando..." : "Confirmar pedido"}
          </button>
        </form>

        <div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="font-semibold text-base text-black mb-4">
              Resumo
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.variant.id} className="flex justify-between text-sm">
                  <div className="text-gray-700">
                    <p className="font-medium leading-snug">{item.product.name}</p>
                    <p className="text-gray-400 text-xs">
                      {item.variant.name} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 ml-2">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-bold text-black">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {form.delivery_type === "uber"
                  ? "Frete a combinar"
                  : "Retirada na loja"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
