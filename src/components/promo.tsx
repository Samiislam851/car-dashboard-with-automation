import Image from "next/image";
import { ArrowRight } from "lucide-react";

const PROMOS = [
  {
    title: "The best platform for car rental",
    body: "Ease of doing a car rental safely and reliably. Of course at a low price.",
    cta: "Rental Car",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    alt: "A car on a coastal road",
  },
  {
    title: "Easy way to rent a car at a low price",
    body: "Providing cheap car rental services and safe and comfortable facilities.",
    cta: "Rental Car",
    image: "https://images.unsplash.com/photo-1618863099278-75222d755814?q=80&w=2070",
    alt: "a roadster on the road",
  },
];

export function Promo() {
  return (
    <section className="bg-surface py-24">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        {PROMOS.map((promo) => (
          <article
            key={promo.title}
            className="relative flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[10px] p-8 text-white sm:p-10"
          >
            <Image
              src={promo.image}
              alt={promo.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />

            {/*
              Dark on the left where the copy sits, clearing to the right so the car stays visible.
              White text needs a dark scrim — the previous 82% orange wash hid the photo entirely.
            */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-ink/85 from-15% via-ink/65 via-55% to-ink/25"
            />

            <div className="relative z-10 max-w-[320px]">
              <h3 className="text-2xl font-semibold leading-snug sm:text-[32px]">{promo.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-white/90">{promo.body}</p>
              <a
                href="#rental-deals"
                className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white/90"
              >
                {promo.cta}
                <ArrowRight size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
