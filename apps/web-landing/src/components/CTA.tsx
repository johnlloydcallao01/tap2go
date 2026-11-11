import Link from "next/link";

export function CTA(): React.JSX.Element {
  return (
    <section className="bg-primary py-16 text-stone-950 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-stone-800">Let&apos;s eat</p>
          <h2 className="heading-primary text-3xl tracking-tight sm:text-5xl">
            Find something good nearby.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-stone-800">
            Get the Tap2Go app and discover what can be delivered to your address.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/download"
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-4 font-semibold text-orange-800 transition-colors hover:bg-orange-50"
          >
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-3" />
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center justify-center rounded-xl border border-stone-900/30 px-6 py-4 font-semibold text-stone-950 transition-colors hover:bg-stone-950/10"
          >
            Read FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}
