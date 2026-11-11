import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Download Tap2Go",
  description: "Continue to Tap2Go to access your account and orders.",
};

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="flex min-h-[65vh] items-center justify-center bg-secondary px-4 py-16">
        <div className="max-w-xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-2xl text-orange-700">
            <i aria-hidden="true" className="fas fa-user" />
          </span>
          <h1 className="heading-primary mt-6 text-4xl text-stone-950">Continue with Tap2Go</h1>
          <p className="mt-4 leading-7 text-stone-600">
            Account access is handled through the Tap2Go app. Download it to reach your account.
          </p>
          <a href="/download" className="btn-primary mt-8">
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
          </a>
        </div>
      </section>
      <Footer />
    </main>
  );
}
