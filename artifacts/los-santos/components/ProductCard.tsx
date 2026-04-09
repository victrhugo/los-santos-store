import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export default function ProductCard({ product }: Props) {
  return (
    <div className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white text-xs font-medium px-2 py-1 rounded text-gray-600 border border-gray-100">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-base font-bold text-black mb-3">
          {formatPrice(product.price)}
        </p>

        <Link
          href={`/product/${product.id}`}
          className="block w-full text-center text-sm font-medium py-2 px-4 border border-black rounded hover:bg-black hover:text-white transition-colors duration-150"
        >
          Ver produto
        </Link>
      </div>
    </div>
  );
}
