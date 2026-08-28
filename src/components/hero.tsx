import Image from "next/image";
import { ShieldCheck } from "lucide-react";

const BANNER = "/hero_banner.jpg";

export function Hero() {
  return (
    <section
      id="home"
      // Pulled up under the transparent header so the photo runs edge to edge on desktop.
      className="relative -mt-[76px] overflow-hidden bg-surface pt-[76px] pb-40 lg:min-h-[800px] lg:pb-48"
    >
      {/*
        Desktop only: full-bleed background, cropped to the top so the car sits low and centre-right.
        `display:none` alone would still download the file, so `sizes` tells narrow viewports the
        image is 1px wide and the browser picks the smallest srcset entry instead.
      */}
      <div className="absolute inset-0 hidden lg:block">
        <Image
          src={BANNER}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 100vw, 1px"
          className="object-cover object-top"
        />
      </div>

      {/*
        Grey on the left for the copy, fading out well before the car so the vehicle stays
        completely clear. Stops end at 60% — the car starts at roughly 48% of the width.
      */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block lg:bg-gradient-to-r lg:from-surface lg:from-25% lg:via-surface/75 lg:via-42% lg:to-transparent lg:to-60%"
      />

      <div className="relative z-10 container-page pt-10 lg:pt-20">
        <div className="max-w-[560px] animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm">
            <ShieldCheck size={16} />
            100% Trusted car rental platform in the UK
          </p>
          <h1 className="mt-6 text-4xl font-extrabold uppercase leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-[46px]">
            Fast and easy way to <span className="text-brand-600">rent a car</span>
          </h1>
          <p className="mt-6 max-w-[534px] text-base leading-relaxed font-medium text-ink/80">
            Our online booking system is designed to meet the specific needs of car rental business
            owners. This easy-to-use car rental software lets you manage the whole journey — from
            search to keys in hand.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#search"
              className="rounded-md bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
            >
              Booking Now
            </a>
            <a
              href="#rental-deals"
              className="rounded-md bg-white px-8 py-3.5 text-base font-semibold text-ink shadow-sm transition hover:bg-white/90"
            >
              See all cars
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
