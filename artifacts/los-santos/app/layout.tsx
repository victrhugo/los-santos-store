import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { CartUIProvider } from "@/components/CartUIContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
import FloatingContacts from "@/components/FloatingContacts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-white text-gray-900 antialiased`}>
        <CartProvider>
          <CartUIProvider>
            <Header />
            <main className="min-h-[calc(100vh-64px)]">{children}</main>
            <footer className="mt-20 border-t border-gray-100 py-8 text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Los Santos Store. Todos os direitos
              reservados.
            </footer>
            <FloatingContacts />
            <CartDrawer />
          </CartUIProvider>
        </CartProvider>
      </body>
    </html>
  );
}
