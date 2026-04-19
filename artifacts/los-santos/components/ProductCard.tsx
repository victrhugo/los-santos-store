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
  const hoverImage = !soldOut ? (product.product_images?.[0]?.image_url ?? null) : null;

  const imageArea = (
    <div className="px-3 pt-3">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
        {product.image_url ? (
          <>
            {/* Primary image */}
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-500 ease-out ${
                soldOut
                  ? "opacity-50"
                  : hoverImage
                  ? "group-hover:opacity-0 group-hover:scale-[1.02]"
                  : "group-hover:scale-[1.04]"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Hover image — second image, desktop only via CSS hover */}
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={product.name}
                fill
                className="object-cover opacity-0 scale-[1.02] group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
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
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-all duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-md translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
              Ver produto
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const infoArea = (
    <div className="px-4 pt-3.5 pb-4 flex flex-col gap-1 flex-1">
      {categoryName && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          {categoryName}
        </p>
      )}
      <h3 className={`text-sm leading-snug line-clamp-2 ${soldOut ? "text-gray-400 font-normal" : "text-gray-900 font-semibold"}`}>
        {product.name}
      </h3>
      <p className={`text-[17px] font-bold tracking-tight mt-1 ${soldOut ? "text-gray-300" : "text-black"}`}>
        {formatPrice(product.price)}
      </p>
    </div>
  );

  if (soldOut) {
    return (
      <div className="flex flex-col bg-white rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.06)] opacity-55 cursor-not-allowed overflow-hidden">
        {imageArea}
        {infoArea}
      </div>
    );
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {imageArea}
      {infoArea}
    </Link>
  );
}
