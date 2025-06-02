import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import LoadingProvider from "@/components/loading/LoadingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tap2Go - Food Delivery",
  description: "Professional multivendor food delivery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <LoadingProvider variant="facebook" showInitialLoad={true}>
            <CartProvider>
              {children}
            </CartProvider>
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
