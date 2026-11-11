import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Get Started with Tap2Go",
  description: "Download Tap2Go to get started with food delivery.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="flex min-h-[65vh] items-center justify-center bg-secondary px-4 py-16">
        <div className="max-w-xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-2xl text-orange-700">
            <i aria-hidden="true" className="fas fa-bag-shopping" />
          </span>
          <h1 className="heading-primary mt-6 text-4xl text-stone-950">Get started with Tap2Go</h1>
          <p className="mt-4 leading-7 text-stone-600">
            Find restaurants and check delivery availability for your address in the Tap2Go ordering experience.
          </p>
          <a href="/download" className="btn-primary mt-8">
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2" />
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
