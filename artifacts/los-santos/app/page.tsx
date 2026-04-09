import { getProducts } from "@/services/products";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  let error = null;

  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar produtos";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          Nossa coleção
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Roupas, acessórios e perfumes com estilo
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {products.length === 0 && !error && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Nenhum produto encontrado</p>
          <p className="text-sm mt-1">Os produtos aparecerão aqui quando forem cadastrados.</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
