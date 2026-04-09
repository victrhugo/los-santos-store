import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Los Santos Store",
  description: "Loja de roupas, acessórios e perfumes",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
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
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="mt-20 border-t border-gray-100 py-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Los Santos Store. Todos os direitos
            reservados.
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
