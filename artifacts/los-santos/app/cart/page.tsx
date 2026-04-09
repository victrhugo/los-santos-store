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
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="text-gray-300 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-1">
          Seu carrinho está vazio
        </p>
        <p className="text-sm text-gray-400 mb-6">
          Adicione produtos para continuar
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white text-sm font-medium px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-black mb-8">Carrinho</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.variant.id}
              className="flex gap-4 bg-white border border-gray-100 rounded-lg p-4"
            >
              <div className="w-20 h-20 bg-gray-50 rounded overflow-hidden relative flex-shrink-0">
                {item.product.image_url ? (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900 leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.variant.name}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variant.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    aria-label="Remover item"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded">
                    <button
                      onClick={() =>
                        updateQuantity(item.variant.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.variant.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <p className="font-semibold text-sm text-black">
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="font-semibold text-base text-black mb-4">
              Resumo do pedido
            </h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div
                  key={item.variant.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span className="truncate mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="flex-shrink-0">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-black">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full text-center bg-black text-white text-sm font-semibold py-3 rounded hover:bg-gray-800 transition-colors"
            >
              Finalizar compra
            </Link>

            <Link
              href="/"
              className="block w-full text-center text-sm text-gray-500 hover:text-black mt-3 transition-colors"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
