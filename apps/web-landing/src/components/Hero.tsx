import Image from "next/image";
import Link from "next/link";

export function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="relative z-10">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-800">
            <i aria-hidden="true" className="fas fa-location-dot" />
            Good food, closer to home
          </p>
          <h1 className="heading-primary max-w-2xl text-5xl leading-[1.08] tracking-tight text-stone-950 sm:text-6xl lg:text-7xl">
            Your next{" "}
            <span className="block text-orange-600">favorite meal</span>
            {" "}is a tap away.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600 sm:text-xl">
            Sign in, choose a delivery address, explore participating restaurants serving that area, and
            place an order in the Tap2Go app.
          </p>
          <div className="mt-9">
            <Link
              href="/download"
              aria-label="Visit the Tap2Go Android download page"
              className="inline-flex rounded-xl outline-offset-4 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600"
            >
              <Image
                src="/google-play-badge.png"
                alt="Get it on Google Play"
                width={646}
                height={250}
                priority
                className="h-auto w-52 sm:w-60"
              />
            </Link>
          </div>
          <p className="mt-5 text-sm text-stone-500">
            Restaurant listings and delivery options depend on your address and current availability.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-4 rotate-3 rounded-[2.5rem] bg-orange-200/70" />
          <div className="relative overflow-hidden rounded-[2rem] bg-white p-3 shadow-[0_30px_90px_rgba(74,38,10,0.18)]">
            <Image
              src="https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="A freshly prepared burger and fries"
              width={900}
              height={1100}
              priority
              sizes="(max-width: 1024px) 90vw, 42vw"
              className="h-[390px] w-full rounded-[1.5rem] object-cover sm:h-[500px]"
            />
            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur sm:bottom-9 sm:left-9 sm:right-9 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                  <i aria-hidden="true" className="fas fa-bag-shopping" />
                </span>
                <div>
                  <p className="font-semibold text-stone-900">Your order, step by step</p>
                  <p className="mt-0.5 text-sm text-stone-500">Choose an address. Order. Follow updates.</p>
                </div>
                <i aria-hidden="true" className="fas fa-arrow-right ml-auto text-orange-600" />
              </div>
            </div>
          </div>
          <div className="absolute -right-3 top-8 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-stone-950 shadow-lg sm:-right-6 sm:h-20 sm:w-20">
            <i aria-hidden="true" className="fas fa-utensils text-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
