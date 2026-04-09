"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-black mb-2">Pedido confirmado!</h1>
      <p className="text-gray-500 text-sm mb-2">
        Seu pedido foi recebido com sucesso.
      </p>
      {orderId && (
        <p className="text-xs text-gray-400 mb-6">
          Pedido #{orderId.slice(0, 8).toUpperCase()}
        </p>
      )}

      <div className="bg-gray-50 rounded-lg p-5 text-left mb-8">
        <p className="text-sm text-gray-600 leading-relaxed">
          Em breve entraremos em contato via WhatsApp para confirmar os detalhes
          do seu pedido e combinar a entrega ou retirada.
        </p>
      </div>

      <Link
        href="/"
        className="inline-block bg-black text-white text-sm font-semibold px-8 py-3 rounded hover:bg-gray-800 transition-colors"
      >
        Continuar comprando
      </Link>
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
