import { ShieldCheck } from "lucide-react";
import { CarArt } from "./car-art";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-surface pb-40 pt-14 lg:pb-48 lg:pt-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="animate-rise">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
            <ShieldCheck size={16} />
            100% Trusted car rental platform in the UK
          </p>
          <h1 className="mt-6 text-4xl font-extrabold uppercase leading-[1.15] tracking-tight sm:text-5xl lg:text-[46px]">
            Fast and easy way to <span className="text-brand-600">rent a car</span>
          </h1>
          <p className="mt-6 max-w-[534px] text-base leading-relaxed text-ink/60">
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
            <a href="#rental-deals" className="text-base font-semibold underline-offset-4 hover:underline">
              See all cars
            </a>
          </div>
        </div>

        <div className="animate-rise rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-8 sm:p-12 lg:rounded-bl-[63px] lg:rounded-tr-3xl">
          <CarArt className="w-full drop-shadow-2xl" tint="#ffffff" />
        </div>
      </div>
    </section>
  );
}
