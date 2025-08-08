import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AdminAuthProvider } from "@/contexts/AuthContext";
import AdminLayoutWrapper from "@/components/layout/AdminLayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tap2Go Admin Panel",
  description: "Administrative dashboard for Tap2Go food delivery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminAuthProvider>
          <AdminLayoutWrapper>
            {children}
          </AdminLayoutWrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
