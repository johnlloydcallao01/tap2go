import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "About Tap2Go",
  description:
    "Learn about Tap2Go, the food-ordering app founded by Ronilo Datuin, and how customers use it to discover restaurants and follow orders.",
};

export default function AboutPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="bg-secondary px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">About Tap2Go</p>
          <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">
            Food ordering, connected in one app.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            Tap2Go is a food-ordering app where signed-in customers can choose a delivery address, explore
            participating restaurants, browse menus, place orders, and check order updates.
          </p>
          <a href="/download" className="btn-primary mt-8">
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2" />
          </a>
        </div>
      </section>
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {[
            ["Explore", "After signing in, choose a delivery address to see participating restaurants and food options available for that area."],
            ["Choose and order", "Browse a restaurant's menu, add items to its cart, then review the delivery quote and available payment methods at checkout."],
            ["Follow your order", "Check order status in Tap2Go. Delivery tracking and rider details may be available as the delivery progresses."],
            ["Founded by Ronilo Datuin", "Tap2Go was founded by Ronilo Datuin."],
          ].map(([title, description], index) => (
            <article key={title} className="rounded-3xl border border-stone-200 p-7">
              {index < 3 && (
                <span className="text-sm font-bold tracking-widest text-orange-700">0{index + 1}</span>
              )}
              <h2 className="heading-secondary mt-5 text-2xl text-stone-900">{title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{description}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-stone-500">
          Restaurant availability, delivery service and quotes, and payment options vary by address and order.
          Rider tracking details depend on delivery progress and rider assignment.
        </p>
        <div className="mt-8 text-center">
          <Link href="/faq" className="font-semibold text-orange-700 hover:text-orange-800">
            Learn more in our FAQs <i aria-hidden="true" className="fas fa-arrow-right ml-1 text-xs" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
