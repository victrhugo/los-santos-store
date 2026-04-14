import type { ProductImage } from "@/types";

/** Deduplica URLs mantendo a ordem. */
function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/**
 * Monta a lista da galeria sem misturar duas fontes:
 * - Se houver linhas em `product_images`, usa só essas URLs.
 * - Caso contrário, usa apenas `products.image_url`.
 */
export function buildProductGalleryUrls(
  primaryImageUrl: string | null | undefined,
  productImages: ProductImage[]
): string[] {
  const fromProductImages = productImages
    .map((row) => row.image_url?.trim())
    .filter((u): u is string => Boolean(u));

  if (fromProductImages.length > 0) {
    return dedupeUrls(fromProductImages);
  }

  const primary = primaryImageUrl?.trim();
  if (primary) {
    return [primary];
  }

  return [];
}
