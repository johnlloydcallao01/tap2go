import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Get Started | Tap2Go",
  description: "Start discovering nearby restaurants and ordering food with Tap2Go.",
};

const steps = [
  ["Set your address", "See which participating restaurants and delivery options are available near you."],
  ["Pick your meal", "Browse restaurant menus and add the items you want to your cart."],
  ["Checkout and follow along", "Review your delivery quote and available payment methods, then follow order updates in Tap2Go."],
];

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">Get started</p>
          <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">
            Your next meal starts here.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Discover restaurants near you, choose from their menus, and place an order with Tap2Go.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/download" className="btn-primary justify-center px-6 py-4">
              Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
            </a>
          </div>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {steps.map(([title, description], index) => (
            <article key={title} className="rounded-3xl border border-stone-200 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                {index + 1}
              </span>
              <h2 className="heading-secondary mt-6 text-xl text-stone-900">{title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{description}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-9 max-w-3xl text-center text-sm leading-6 text-stone-500">
          Restaurant listings, delivery availability, and payment methods may vary based on your address and order.
        </p>
        <p className="mt-8 text-center">
          <Link href="/faq" className="font-semibold text-orange-700 hover:text-orange-800">
            Questions? Read the FAQs <i aria-hidden="true" className="fas fa-arrow-right ml-1 text-xs" />
          </Link>
        </p>
      </section>
      <Footer />
    </main>
  );
}
