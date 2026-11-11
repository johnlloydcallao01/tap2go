const steps = [
  {
    number: "01",
    icon: "fa-location-dot",
    title: "Set your address",
    description: "After signing in, choose where you want your order delivered to see the restaurants and food options serving that area.",
  },
  {
    number: "02",
    icon: "fa-book-open",
    title: "Choose your food",
    description: "Browse a restaurant's menu, select the items and options you want, and add them to your cart.",
  },
  {
    number: "03",
    icon: "fa-credit-card",
    title: "Review and place your order",
    description: "Confirm the delivery address, check the quoted delivery fee, and choose a payment method offered at checkout.",
  },
  {
    number: "04",
    icon: "fa-motorcycle",
    title: "Follow its progress",
    description: "Check order updates; delivery tracking and rider details are shown when available for your order.",
  },
];

export function Stats() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-secondary py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-6 md:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">How ordering works</p>
            <h2 className="heading-primary max-w-2xl text-3xl tracking-tight text-stone-950 sm:text-5xl">
              From choosing an address to following your order.
            </h2>
          </div>
          <p className="max-w-lg leading-7 text-stone-600 md:justify-self-end">
            Restaurant availability, delivery quotes, payment methods, and tracking details can vary by address and order.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="relative rounded-3xl bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold tracking-widest text-orange-700">{step.number}</span>
                <i aria-hidden="true" className={`fas ${step.icon} text-xl text-orange-600`} />
              </div>
              <h3 className="mt-8 font-display text-2xl font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-3 leading-7 text-stone-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
