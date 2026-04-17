"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  product_name: string | null;
  variant_name: string | null;
  quantity: number;
  price: number;
}

interface RawItem {
  quantity: number;
  price: number;
  product_variants?: {
    name: string;
    products?: { name: string } | null;
  } | null;
}

interface OrderSummary {
  total: number;
  items: OrderItem[];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select(`
        total,
        order_items(
          quantity,
          price,
          product_variants!product_variant_id(
            name,
            products(name)
          )
        )
      `)
      .eq("id", orderId)
      .single()
      .then(({ data }) => {
        if (data) {
          setSummary({
            total: Number(data.total),
            items: ((data.order_items ?? []) as RawItem[]).map((item) => ({
              product_name: item.product_variants?.products?.name ?? null,
              variant_name: item.product_variants?.name ?? null,
              quantity: item.quantity,
              price: item.price,
            })),
          });
        }
      });
  }, [orderId]);

  const shortId = orderId?.slice(0, 8).toUpperCase();

  const whatsappUrl = `https://wa.me/5512982949620?text=${encodeURIComponent(
    `Olá! Acabei de fazer o pedido #${shortId} no site e gostaria de confirmar os detalhes.`
  )}`;

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {/* Check icon */}
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-black mb-2">Pedido recebido!</h1>
      <p className="text-gray-500 text-sm mb-1">
        Obrigado pela compra. Seu pedido já está com a gente.
      </p>
      {shortId && (
        <p className="text-xs text-gray-400 font-mono tracking-widest mb-8">
          #{shortId}
        </p>
      )}

      {/* Order summary */}
      {summary && summary.items.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-5 text-left mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Resumo do pedido
          </p>
          <div className="space-y-3">
            {summary.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 leading-snug">
                    {item.product_name ?? "Produto"}
                  </p>
                  {item.variant_name && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.variant_name}</p>
                  )}
                  <p className="text-xs text-gray-400">{item.quantity}x {formatPrice(item.price)}</p>
                </div>
                <p className="font-semibold text-gray-900 flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-3 flex justify-between font-bold text-black text-sm">
            <span>Total</span>
            <span>{formatPrice(summary.total)}</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-5 text-left mb-6">
        <p className="text-sm text-gray-600 leading-relaxed">
          Em breve entraremos em contato via WhatsApp para confirmar os detalhes
          e combinar a entrega ou retirada. Fique de olho no seu telefone!
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-8 py-3 rounded transition-colors"
        >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Falar com a loja
        </a>
        <Link
          href="/"
          className="inline-block bg-black text-white text-sm font-semibold px-8 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Continuar comprando
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
