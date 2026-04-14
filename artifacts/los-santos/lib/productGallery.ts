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
 * Monta a galeria mantendo a capa original primeiro e adicionando as demais
 * imagens cadastradas depois, sem repetir URLs.
 */
export function buildProductGalleryUrls(
  primaryImageUrl: string | null | undefined,
  productImages: ProductImage[]
): string[] {
  const primary = primaryImageUrl?.trim();
  const fromProductImages = productImages
    .map((row) => row.image_url?.trim())
    .filter((u): u is string => Boolean(u));

  return dedupeUrls([
    ...(primary ? [primary] : []),
    ...fromProductImages,
  ]);
}
