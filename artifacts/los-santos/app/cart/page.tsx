"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartContext";

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-800 mb-1">Seu carrinho está vazio</p>
        <p className="text-sm text-gray-400 mb-7">Adicione produtos para continuar</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-black">Carrinho</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.variant.id}
              className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors"
            >
              {/* Image */}
              <div className="w-[88px] h-[88px] bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2">
                      {item.product.name}
                    </p>
                    {item.variant.name !== "Padrão" && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.variant.name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.variant.id)}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    aria-label="Remover item"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity control */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors text-base"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      disabled={item.quantity >= item.variant.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors disabled:text-gray-200 disabled:cursor-not-allowed text-base"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-black text-base text-black">
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>
                </div>

                {item.quantity >= item.variant.stock && (
                  <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    Quantidade máxima disponível
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-24">
            <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-5">
              Resumo do pedido
            </h2>

            {/* Item breakdown */}
            <div className="space-y-2.5 mb-5">
              {items.map((item) => (
                <div key={item.variant.id} className="flex justify-between text-sm text-gray-500">
                  <span className="truncate mr-2 leading-snug">
                    {item.product.name}
                    {item.variant.name !== "Padrão" && (
                      <span className="text-gray-400"> · {item.variant.name}</span>
                    )}
                    <span className="text-gray-400"> × {item.quantity}</span>
                  </span>
                  <span className="flex-shrink-0 font-medium text-gray-700">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-gray-500">Total</span>
                <span className="text-3xl font-black text-black tracking-tight">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 bg-black text-white font-bold text-base py-4 rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all shadow-lg shadow-black/10"
            >
              Finalizar compra
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            <Link
              href="/"
              className="flex w-full items-center justify-center text-sm text-gray-400 hover:text-black mt-3 py-2 transition-colors"
            >
              ← Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
