import { ArrowRight } from "lucide-react";
import { CarArt } from "./car-art";

const PROMOS = [
  {
    title: "The best platform for car rental",
    body: "Ease of doing a car rental safely and reliably. Of course at a low price.",
    cta: "Rental Car",
    from: "from-brand-600",
    to: "to-brand-500",
    tint: "#ffffff",
  },
  {
    title: "Easy way to rent a car at a low price",
    body: "Providing cheap car rental services and safe and comfortable facilities.",
    cta: "Rental Car",
    from: "from-brand-700",
    to: "to-brand-600",
    tint: "#ffffff",
  },
];

export function Promo() {
  return (
    <section className="bg-surface py-24">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        {PROMOS.map((promo) => (
          <div
            key={promo.title}
            className={`flex flex-col justify-between overflow-hidden rounded-[10px] bg-gradient-to-br ${promo.from} ${promo.to} p-8 text-white sm:p-10`}
          >
            <div className="max-w-[320px]">
              <h3 className="text-2xl font-semibold leading-snug sm:text-[32px]">{promo.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-white/80">{promo.body}</p>
              <a
                href="#rental-deals"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white/90"
              >
                {promo.cta}
                <ArrowRight size={16} />
              </a>
            </div>
            <CarArt tint={promo.tint} className="mt-10 w-full max-w-[420px] self-end opacity-95" />
          </div>
        ))}
      </div>
    </section>
  );
}
