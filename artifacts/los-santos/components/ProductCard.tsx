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
  const categoryName = product.categories?.name ?? null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {categoryName && (
          <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {categoryName}
          </span>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
          <span className="bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            Ver produto
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1 flex-1">
        <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-base font-bold text-black mt-auto pt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
