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

function isSoldOut(product: Product): boolean {
  const variants = product.product_variants ?? [];
  if (variants.length === 0) return false;
  return variants.every((v) => v.stock <= 0);
}

function isNew(product: Product): boolean {
  const created = new Date(
    product.created_at.endsWith("Z") || product.created_at.includes("+")
      ? product.created_at
      : product.created_at + "Z"
  );
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 14;
}

function isLowStock(product: Product): boolean {
  const variants = product.product_variants ?? [];
  if (variants.length === 0) return false;
  const total = variants.reduce((sum, v) => sum + v.stock, 0);
  return total > 0 && total <= 5;
}

type BadgeKind = "soldout" | "low" | "new" | null;

function getBadge(product: Product): BadgeKind {
  if (isSoldOut(product)) return "soldout";
  if (isLowStock(product)) return "low";
  if (isNew(product)) return "new";
  return null;
}

const BADGE_STYLES: Record<NonNullable<BadgeKind>, { label: string; className: string }> = {
  soldout: { label: "Esgotado",         className: "bg-gray-900/85 text-white" },
  low:     { label: "Últimas unidades", className: "bg-amber-500/90 text-white" },
  new:     { label: "Novo",             className: "bg-black text-white" },
};

export default function ProductCard({ product }: Props) {
  const soldOut = isSoldOut(product);
  const badge = getBadge(product);
  const categoryName = product.categories?.name ?? null;

  const imageArea = (
    <div className="px-3 pt-3">
      <div className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 ${soldOut ? "" : "group-hover:shadow-md transition-shadow duration-300"}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-500 ${
              soldOut ? "opacity-50" : "group-hover:scale-[1.07]"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center text-gray-200 ${soldOut ? "opacity-50" : ""}`}>
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Status badge — top right */}
        {badge && (
          <span className={`absolute top-2 right-2 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_STYLES[badge].className}`}>
            {BADGE_STYLES[badge].label}
          </span>
        )}

        {/* Hover CTA overlay */}
        {!soldOut && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span className="bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
              Ver produto
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const infoArea = (
    <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-0.5 flex-1">
      {categoryName && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
          {categoryName}
        </p>
      )}
      <h3 className={`text-sm leading-snug line-clamp-2 ${soldOut ? "text-gray-400 font-normal" : "text-gray-700 font-medium"}`}>
        {product.name}
      </h3>
      <p className={`text-xl font-black tracking-tight mt-1.5 ${soldOut ? "text-gray-300" : "text-black"}`}>
        {formatPrice(product.price)}
      </p>
    </div>
  );

  if (soldOut) {
    return (
      <div className="flex flex-col bg-white rounded-2xl border border-gray-100 cursor-not-allowed overflow-hidden">
        {imageArea}
        {infoArea}
      </div>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      {imageArea}
      {infoArea}
    </Link>
  );
}
