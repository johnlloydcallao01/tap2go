import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import LoadingProvider from "@/components/loading/LoadingProvider";
import ReduxProvider from "@/store/ReduxProvider";
import ChatWidget from "@/components/chatbot/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tap2Go - Food Delivery",
  description: "Professional multivendor food delivery platform",
  other: {
    "theme-color": "#f3a823",
    "msapplication-navbutton-color": "#f3a823",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReduxProvider>
          <AuthProvider>
            <LoadingProvider variant="facebook" showInitialLoad={true}>
              <CartProvider>
                {children}
                {/* Global Chatbot Widget */}
                <ChatWidget
                  showWelcomeMessage={true}
                  autoOpen={false}
                  theme="orange"
                  position="bottom-left"
                />
              </CartProvider>
            </LoadingProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
