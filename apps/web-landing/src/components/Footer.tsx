import Image from "next/image";
import Link from "next/link";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/cookie-policy", label: "Cookies" },
  { href: "/account-deletion-request", label: "Account deletion" },
  { href: "/data-deletion-request", label: "Data deletion" },
];

export function Footer(): React.JSX.Element {
  return (
    <footer className="bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="" width={44} height={44} className="rounded-full" />
            <span className="font-display text-xl font-bold">Tap2Go</span>
          </Link>
          <p className="mt-4 leading-7 text-stone-400">
            Discover nearby restaurants, browse their menus, and follow your delivery with Tap2Go.
            Availability depends on your location.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-3">
          <Link href="/about" className="text-stone-300 hover:text-white">About Tap2Go</Link>
          <Link href="/how-it-works" className="text-stone-300 hover:text-white">How it works</Link>
          <Link href="/faq" className="text-stone-300 hover:text-white">FAQs</Link>
          <Link href="/contact" className="text-stone-300 hover:text-white">Contact</Link>
          <Link href="/download" className="text-stone-300 hover:text-white">Download App</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Tap2Go. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-stone-300">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
