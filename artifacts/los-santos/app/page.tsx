import { getProducts } from "@/services/products";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60;

export default async function HomePage() {
  let products = [];
  let error = null;

  try {
    products = await getProducts();
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar produtos";
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  return <HomeClient products={products} />;
}
