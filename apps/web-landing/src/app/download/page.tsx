import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=com.wnapp.id1721090048598&pcampaignid=web_share";

export const metadata: Metadata = {
  title: "Download Tap2Go for Android",
  description:
    "Download the Tap2Go customer app for Android from Google Play to discover restaurants, order food, and follow your delivery.",
  openGraph: {
    title: "Download Tap2Go for Android",
    description:
      "Get the Tap2Go customer app on Google Play and discover restaurants near you.",
    type: "website",
  },
};

const appBenefits = [
  {
    icon: "fa-location-dot",
    title: "Discover nearby restaurants",
    description: "See participating restaurants and delivery availability for your address.",
  },
  {
    icon: "fa-bag-shopping",
    title: "Browse menus and order",
    description: "Choose menu items, review your cart, and check out in the app.",
  },
  {
    icon: "fa-motorcycle",
    title: "Follow your delivery",
    description: "Check order updates and rider information as your delivery progresses.",
  },
];

export default function DownloadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-secondary px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
          <div className="absolute -bottom-48 left-0 h-96 w-96 rounded-full bg-orange-100/80 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-800">
                <i aria-hidden="true" className="fab fa-android text-lg" />
                Tap2Go for Android
              </p>
              <h1 className="heading-primary max-w-2xl text-4xl tracking-tight text-stone-950 sm:text-6xl">
                Good food is just a tap away.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
                Get the Tap2Go customer app on Google Play. Discover nearby restaurants, browse menus,
                place your order, and follow delivery updates in one place.
              </p>
              <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Tap2Go on Google Play"
                className="mt-8 inline-flex rounded-xl outline-offset-4 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
              >
                <Image
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  width={646}
                  height={250}
                  priority
                  className="h-auto w-52 sm:w-60"
                />
              </a>
              <p className="mt-4 text-sm text-stone-500">
                Opens the official Google Play listing for the Tap2Go Android app.
              </p>
            </div>

            <div className="mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border border-stone-200 bg-white p-7 text-center shadow-[0_30px_90px_rgba(74,38,10,0.12)] sm:p-9">
                <Image
                  src="/logo.png"
                  alt="Tap2Go app icon"
                  width={160}
                  height={160}
                  className="mx-auto h-32 w-32 rounded-[2rem] object-cover shadow-md sm:h-40 sm:w-40"
                />
                <h2 className="mt-6 font-display text-2xl font-bold text-stone-950">Tap2Go</h2>
                <p className="mt-1 text-stone-500">Food delivery</p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-stone-600">
                  <i aria-hidden="true" className="fab fa-google-play text-[#34a853]" />
                  Available on Google Play
                </div>
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-7 w-full justify-center py-4"
                >
                  Download for Android
                  <i aria-hidden="true" className="fas fa-arrow-up-right-from-square ml-2 text-xs" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
                Made for mealtime
              </p>
              <h2 className="heading-primary text-3xl tracking-tight text-stone-950 sm:text-4xl">
                Your food journey, all in the app.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {appBenefits.map((benefit) => (
                <article key={benefit.title} className="rounded-3xl border border-stone-200 p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-lg text-orange-700">
                    <i aria-hidden="true" className={`fas ${benefit.icon}`} />
                  </span>
                  <h3 className="heading-secondary mt-6 text-xl text-stone-900">{benefit.title}</h3>
                  <p className="mt-3 leading-7 text-stone-600">{benefit.description}</p>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-stone-500">
              Restaurant listings, delivery availability, and payment methods may vary based on your address
              and order.
            </p>
            <p className="mt-6 text-center">
              <Link href="/how-it-works" className="font-semibold text-orange-700 hover:text-orange-800">
                See how Tap2Go works <i aria-hidden="true" className="fas fa-arrow-right ml-1 text-xs" />
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
