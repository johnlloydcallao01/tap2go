"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-3" aria-label="Tap2Go home">
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-11 w-11 rounded-full object-cover"
          />
          <span className="font-display text-xl font-bold tracking-tight text-stone-900">
            Tap<span className="text-orange-600">2</span>Go
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className="site-nav-link text-sm font-medium text-stone-600 transition-colors hover:text-orange-700 aria-[current=page]:text-orange-700"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/download" className="btn-primary">
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-stone-700 hover:bg-stone-100 md:hidden"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <i aria-hidden="true" className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"} text-lg`} />
        </button>
      </nav>

      {isMenuOpen && (
        <div id="mobile-navigation" className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className="site-nav-link site-nav-link--mobile rounded-lg px-3 py-3 font-medium text-stone-700 hover:bg-orange-50 hover:text-orange-700 aria-[current=page]:text-orange-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/download" className="btn-primary mt-2 justify-center" onClick={() => setIsMenuOpen(false)}>
              Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
