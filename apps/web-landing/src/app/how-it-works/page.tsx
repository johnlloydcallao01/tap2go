import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how to download Tap2Go, choose a delivery address, order from a participating restaurant, check out, and follow your order.",
};

const steps = [
  {
    number: "01",
    icon: "fa-download",
    title: "Download Tap2Go",
    description:
      "Get the Tap2Go customer app for Android from Google Play to start ordering.",
    action: "Get the app",
    href: "/download",
  },
  {
    number: "02",
    icon: "fa-user",
    title: "Sign in or create an account",
    description:
      "Sign in to your customer account, or create one in the app. You need to be signed in to view nearby merchants.",
  },
  {
    number: "03",
    icon: "fa-location-dot",
    title: "Choose your delivery address",
    description:
      "Select a saved address or add a delivery address. Your address helps determine which merchants and delivery options are available.",
  },
  {
    number: "04",
    icon: "fa-magnifying-glass",
    title: "Select a merchant",
    description:
      "Explore the participating restaurants and food options available for your address, then open a merchant to see its menu.",
  },
  {
    number: "05",
    icon: "fa-utensils",
    title: "Choose menu items",
    description:
      "Select the dishes you want. Where offered, choose product options or modifiers, then add each item to that merchant's cart.",
  },
  {
    number: "06",
    icon: "fa-basket-shopping",
    title: "Review your cart",
    description:
      "Check the items, quantities, and subtotal in your cart. When the merchant is accepting orders, continue to checkout.",
  },
  {
    number: "07",
    icon: "fa-credit-card",
    title: "Check out and place your order",
    description:
      "Confirm your delivery address, review the delivery quote and order total, choose a payment method offered for your order, and submit it.",
  },
  {
    number: "08",
    icon: "fa-motorcycle",
    title: "Follow order updates",
    description:
      "Check your order status in the app. For active deliveries, tracking can show a map and rider details when a rider is assigned.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
              How it works
            </p>
            <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">
              From downloading the app to tracking your order.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
              Here&apos;s how to find a participating restaurant, place an order, and keep up with its progress in Tap2Go.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <ol className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="flex flex-col rounded-3xl border border-stone-200 p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-widest text-orange-700">
                    {step.number}
                  </span>
                  <i aria-hidden="true" className={`fas ${step.icon} text-xl text-orange-600`} />
                </div>
                <h2 className="heading-secondary mt-7 text-2xl text-stone-900">{step.title}</h2>
                <p className="mt-3 flex-1 leading-7 text-stone-600">{step.description}</p>
                {step.href && step.action && (
                  <Link href={step.href} className="mt-5 inline-flex items-center gap-2 font-semibold text-orange-700 hover:text-orange-800">
                    {step.action}
                    <i aria-hidden="true" className="fas fa-arrow-right text-xs" />
                  </Link>
                )}
              </li>
            ))}
          </ol>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-stone-500">
            Merchant availability, delivery service and quotes, and payment methods vary by address and order. Tracking and rider details depend on delivery progress and rider assignment.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/download" className="btn-primary justify-center">
              Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
            </Link>
            <Link href="/faq" className="btn-secondary justify-center">
              Read FAQs <i aria-hidden="true" className="fas fa-arrow-right ml-2 text-xs" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
