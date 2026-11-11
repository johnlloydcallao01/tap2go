import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export default function DataDeletionRequestPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="pt-24 pb-16 bg-gradient-to-br from-[#201a7c]/5 to-[#ab3b43]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-primary text-4xl md:text-5xl text-gray-900 mb-6">
              Data Deletion Request
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This page explains how you can request deletion of personal data
              associated with your account.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-body text-gray-700">
          <div className="space-y-4">
            <h2 className="heading-secondary text-2xl font-semibold text-gray-900">
              1. Types of data you can request to delete
            </h2>
            <p>
              Depending on how you use our services, you can request deletion of
              personal data such as your profile information, contact details,
              order history, and usage data that can be linked to your
              account.
            </p>
            <p>
              In some cases, we may need to retain certain information for legal
              or regulatory reasons, such as transaction records or information
              required to comply with applicable laws.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="heading-secondary text-2xl font-semibold text-gray-900">
              2. Check options in Tap2Go
            </h2>
            <p>
              Open the Tap2Go app and review the account settings available to your
              account. If a data deletion option is available, follow its
              instructions to submit your request.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="heading-secondary text-2xl font-semibold text-gray-900">
              3. Contact Tap2Go
            </h2>
            <p>
              This website does not provide a data deletion form or publish a
              support email address. See the Contact page for the official
              Tap2Go destinations currently available.
            </p>
            <p className="flex flex-wrap gap-4 font-medium">
              <Link href="/contact" className="text-orange-700 hover:text-orange-800">
                Contact page
              </Link>
              <Link href="/account-deletion-request" className="text-orange-700 hover:text-orange-800">
                Account deletion
              </Link>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="heading-secondary text-2xl font-semibold text-gray-900">
              4. How we process data deletion requests
            </h2>
            <p>
              The handling and timing of a request may depend on the data
              involved and any applicable legal or regulatory record-retention
              requirements. This website does not publish a processing
              timeline.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
