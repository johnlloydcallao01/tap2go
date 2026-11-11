const features = [
  {
    icon: "fa-location-dot",
    title: "Choose your delivery address",
    description: "Sign in and set an address to see food categories and participating restaurants serving that area.",
  },
  {
    icon: "fa-book-open",
    title: "Explore menus and build a cart",
    description: "Browse a restaurant's menu, select available product options, and add items to that restaurant's cart.",
  },
  {
    icon: "fa-location-dot",
    title: "Review delivery before checkout",
    description: "Confirm your delivery address and check the delivery quote shown for your order before placing it.",
  },
  {
    icon: "fa-credit-card",
    title: "Choose an available payment method",
    description: "Checkout can offer options such as GCash, GrabPay, Maya, BillEase, online banking, or QR Ph. Available methods may vary.",
  },
  {
    icon: "fa-route",
    title: "Follow order updates",
    description: "Check your order status. Active delivery tracking can show rider details and location when a rider is assigned.",
  },
  {
    icon: "fa-heart",
    title: "Manage your Tap2Go account",
    description: "Keep track of saved addresses, wishlist items, and previous orders in your customer account.",
  },
];

export function Features(): React.JSX.Element {
  return (
    <section id="features" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-orange-700">Made for mealtime</p>
          <h2 className="heading-primary text-3xl tracking-tight text-stone-950 sm:text-5xl">
            The essentials for placing an order.
          </h2>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Browse what is available for your address, review the details at checkout, and keep up with your order in the app.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`rounded-3xl border border-stone-200 p-7 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${
                index === 1 || index === 4 ? "bg-secondary" : "bg-white"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-lg text-orange-700">
                <i aria-hidden="true" className={`fas ${feature.icon}`} />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-stone-900">{feature.title}</h3>
              <p className="mt-3 leading-7 text-stone-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
