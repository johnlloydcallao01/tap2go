const orderSteps = [
  { title: "Order placed", description: "Your order has been submitted to the restaurant.", icon: "fa-check" },
  { title: "Being prepared", description: "The restaurant is preparing your order.", icon: "fa-utensils" },
  { title: "Delivery in progress", description: "Rider and tracking details may appear when a rider is assigned.", icon: "fa-motorcycle" },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">Order updates</p>
          <h2 className="heading-primary text-3xl tracking-tight text-stone-950 sm:text-5xl">
            Keep up with your order after checkout.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
            Check status updates in Tap2Go. For active deliveries, the app can show a map and rider details when a rider is assigned.
          </p>
          <a href="/download" className="btn-secondary mt-8">
            Download App <i aria-hidden="true" className="fas fa-arrow-down-to-line ml-2 text-xs" />
          </a>
        </div>
        <div className="rounded-[2rem] bg-stone-950 p-5 text-white shadow-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-sm text-stone-400">Example order progress</p>
              <p className="mt-1 text-lg font-semibold">Order status</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-stone-950">
              <i aria-hidden="true" className="fas fa-bag-shopping" />
            </span>
          </div>
          <ol className="mt-7 space-y-6">
            {orderSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    index < 2 ? "bg-orange-500 text-stone-950" : "bg-white/10 text-orange-300"
                  }`}
                >
                  <i aria-hidden="true" className={`fas ${step.icon} text-sm`} />
                </span>
                <div className="pt-0.5">
                  <p className="font-semibold">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
