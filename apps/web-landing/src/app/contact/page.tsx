import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Tap2Go",
  description: "Find the right place to start for Tap2Go ordering, account, and privacy questions.",
};

const options = [
  {
    icon: "fa-mobile-screen",
    title: "Download the app",
    description: "Get the Tap2Go app to discover restaurants, view menus, and check delivery availability for your address.",
    label: "Download App",
    href: "/download",
    external: false,
  },
  {
    icon: "fa-mobile-screen",
    title: "Tap2Go app",
    description: "Continue to Tap2Go for your account and orders.",
    label: "Continue to Tap2Go",
    href: "https://app.tap2goph.com/",
    external: true,
  },
  {
    icon: "fa-shield-halved",
    title: "Privacy and account requests",
    description: "Read how to request account or personal-data deletion.",
    label: "View request options",
    href: "/account-deletion-request",
    external: false,
  },
];

export default function ContactPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="bg-secondary px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">We&apos;re here to help</p>
        <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">Contact Tap2Go</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          Have a question or need a hand? Send us a message and we&apos;ll get back to you.
        </p>
      </section>
      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <ContactForm />
          <aside className="space-y-5 lg:pt-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">Other ways to connect</p>
              <h2 className="heading-secondary mt-2 text-2xl text-stone-950">We&apos;re one tap away.</h2>
            </div>
            {options.map((option) => (
              <article key={option.title} className="rounded-2xl border border-stone-200 p-5">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <i aria-hidden="true" className={`fas ${option.icon}`} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-stone-900">{option.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{option.description}</p>
                    {option.external ? (
                      <a href={option.href} className="mt-3 inline-flex font-semibold text-orange-700 hover:text-orange-800">
                        {option.label} <i aria-hidden="true" className="fas fa-arrow-up-right-from-square ml-1 mt-1 text-xs" />
                      </a>
                    ) : (
                      <Link href={option.href} className="mt-3 inline-flex font-semibold text-orange-700 hover:text-orange-800">
                        {option.label} <i aria-hidden="true" className="fas fa-arrow-right ml-1 mt-1 text-xs" />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
            <p className="text-sm leading-6 text-stone-500">
              For order questions, select “Order support” in the form and include your order details.
              Please do not share passwords or payment information.
            </p>
          </aside>
        </div>
        <p className="mt-5 text-center">
          <Link href="/faq" className="font-semibold text-orange-700 hover:text-orange-800">Visit the FAQs</Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
