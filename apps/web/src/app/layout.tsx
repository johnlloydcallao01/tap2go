
import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
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

// Force dynamic rendering for all pages to prevent React 19 serialization issues
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ReduxProvider>
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
        </ReduxProvider>
      </body>
    </html>
  );
}
