import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { AccountDeletionForm } from "@/components/AccountDeletionForm";

export default function AccountDeletionRequestPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="bg-secondary px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
              Account support
            </p>
            <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">
              Request account deletion
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
              Submit a request for your Tap2Go customer, vendor, or rider account. We&apos;ll review it and
              may contact you to verify account ownership before taking action.
            </p>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <AccountDeletionForm />
            <aside className="space-y-6 lg:pt-3">
              <div className="rounded-3xl border border-stone-200 p-6 sm:p-7">
                <h2 className="heading-secondary text-xl text-stone-950">Before you submit</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                  <li className="flex gap-3">
                    <i aria-hidden="true" className="fas fa-envelope mt-1 text-orange-600" />
                    Use the email address associated with the account.
                  </li>
                  <li className="flex gap-3">
                    <i aria-hidden="true" className="fas fa-shield-halved mt-1 text-orange-600" />
                    We may need to verify your identity before processing a request.
                  </li>
                  <li className="flex gap-3">
                    <i aria-hidden="true" className="fas fa-receipt mt-1 text-orange-600" />
                    Order, business, financial, or legally required records may be retained where applicable.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-stone-50 p-6 sm:p-7">
                <h2 className="heading-secondary text-xl text-stone-950">Admin or service account?</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  Admin and service accounts have elevated access and aren&apos;t handled through this public
                  request form. Contact your organization&apos;s administrator.
                </p>
              </div>
              <p className="text-sm leading-6 text-stone-500">
                You can also review our{" "}
                <Link href="/data-deletion-request" className="font-semibold text-orange-700 hover:text-orange-800">
                  data deletion information
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-semibold text-orange-700 hover:text-orange-800">
                  Privacy Policy
                </Link>
                .
              </p>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
