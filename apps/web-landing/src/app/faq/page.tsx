import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about the Tap2Go Android app, delivery addresses, restaurant availability, checkout, payments, order tracking, and account requests.",
};

const faqs = [
  {
    question: "Where can I download Tap2Go?",
    answer: "The Tap2Go customer app is available for Android on Google Play. Use our Download App page to open the official listing.",
    href: "/download",
    linkText: "Download Tap2Go",
  },
  {
    question: "Do I need an account to browse restaurants?",
    answer: "Yes. Sign in or create a customer account in the app to view nearby merchants and food options.",
  },
  {
    question: "How do I find restaurants that deliver to me?",
    answer: "After signing in, select a saved delivery address or add one. Tap2Go uses that address to show participating merchants and delivery options currently available for the area.",
  },
  {
    question: "How do I place an order?",
    answer: "Select an available merchant, choose items from its menu (including any options offered), and add them to that merchant's cart. Review your cart, confirm your delivery address, check the delivery quote and total, select a payment method shown at checkout, and submit the order.",
  },
  {
    question: "Which payment methods can I use?",
    answer: "The app may offer GCash, GrabPay, Maya, BillEase, online banking, or QR Ph. The methods available to you are shown at checkout and can vary. Bank and payment-provider availability may also apply.",
  },
  {
    question: "How much is delivery?",
    answer: "The delivery fee is quoted for your selected address and order during checkout; it is not a single fixed price. Confirm the quote and order total in the app before placing your order. Delivery may not be available for every address.",
  },
  {
    question: "Can I track my delivery?",
    answer: "You can check order status in the app. For an active delivery, tracking may show a map and rider details after a rider is assigned. Tracking information depends on delivery progress and availability.",
  },
  {
    question: "Is delivery available everywhere?",
    answer: "No. Participating merchants, their operating status, and delivery availability depend on your selected address and current operations. Add or select your address in the app to check what is available; availability can change.",
  },
  {
    question: "How do I get help with an order?",
    answer: "Use the Contact page and select the order-support topic. Include the email associated with your Tap2Go account and relevant order details so the support team can review your message. Do not send your password or full payment details.",
    href: "/contact",
    linkText: "Contact Tap2Go",
  },
  {
    question: "How do I request account deletion?",
    answer: "Submit the account deletion request form using the email for your customer, vendor, or driver account. Requests are reviewed and may require ownership verification; submitting the form does not immediately delete the account. Some records may need to be retained.",
    href: "/account-deletion-request",
    linkText: "Request account deletion",
  },
  {
    question: "How do I request data deletion?",
    answer: "See the Data Deletion page for information about requesting deletion of personal data. Account deletion and data deletion requests may be handled differently.",
    href: "/data-deletion-request",
    linkText: "Data deletion information",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="bg-secondary px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">Help center</p>
        <h1 className="heading-primary text-4xl tracking-tight text-stone-950 sm:text-6xl">Frequently asked questions</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-stone-600">
          Quick answers to common questions about ordering with Tap2Go.
        </p>
      </section>
      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl divide-y divide-stone-200">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-stone-900 marker:content-none">
                {faq.question}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 transition-transform group-open:rotate-45">
                  <i aria-hidden="true" className="fas fa-plus text-xs" />
                </span>
              </summary>
              <p className="mt-4 max-w-2xl leading-7 text-stone-600">
                {faq.answer}
                {faq.href && faq.linkText && (
                  <>
                    {" "}
                    <Link href={faq.href} className="font-semibold text-orange-700 hover:text-orange-800">
                      {faq.linkText}
                    </Link>
                    .
                  </>
                )}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/contact" className="btn-primary">
            Contact Tap2Go <i aria-hidden="true" className="fas fa-arrow-right ml-2" />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
