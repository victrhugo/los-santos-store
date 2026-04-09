import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Los Santos — Moda e Estilo",
  description:
    "Loja de roupas, acessórios e perfumes. Estilo com qualidade.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
          <footer className="mt-20 border-t border-gray-100 py-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Los Santos. Todos os direitos
            reservados.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
