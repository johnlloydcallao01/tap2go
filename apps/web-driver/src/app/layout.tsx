'use client';

// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import DriverHeader from "@/components/DriverHeader";
import DriverSidebar from "@/components/DriverSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Don't show header/sidebar on auth page
  const isAuthPage = pathname === '/auth';

  // Handle expand sidebar and navigate to specific page
  const handleExpandAndNavigate = (href: string, categoryName: string) => {
    // First expand the sidebar
    setSidebarCollapsed(false);

    // Then navigate to the specified page
    window.location.href = href;

    // Close mobile sidebar if open
    setSidebarOpen(false);

    // Optional: Add a small delay to show the expansion animation
    setTimeout(() => {
      console.log(`Expanded sidebar and navigated to ${href} from ${categoryName} category`);
    }, 300);
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Fixed at top, starts after sidebar on desktop */}
      <DriverHeader
        onMenuClick={() => setSidebarOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Sidebar - Fixed on left, starts below header */}
      <DriverSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onExpandAndNavigate={handleExpandAndNavigate}
      />

      {/* Main Content - Positioned after header height and sidebar width */}
      <main className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } pt-14 lg:pt-16`}>
        <div className="px-3 pt-8 pb-5 lg:p-4">
          {children}
        </div>
      </main>
    </div>
  );
}

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
        <DriverAuthProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </DriverAuthProvider>
      </body>
    </html>
  );
}
