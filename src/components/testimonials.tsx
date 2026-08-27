"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";
import { SectionHeading } from "./section-heading";

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const last = TESTIMONIALS.length - 1;

  /** Scrolls the track so card `next` sits at the left edge. */
  const go = (next: number) => {
    const track = trackRef.current;
    const card = track?.children[Math.min(Math.max(next, 0), last)] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const nearest = cards.reduce(
      (best, card, i) =>
        Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft) < best.distance
          ? { i, distance: Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft) }
          : best,
      { i: 0, distance: Infinity },
    );
    setIndex(nearest.i);
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2);
  };

  return (
    <section id="testimonial" className="scroll-mt-24 overflow-hidden py-24">
      <div className="container-page">
        <SectionHeading
          title="Trusted by thousands of happy customers"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-16 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="w-full shrink-0 snap-start rounded-[10px] border border-line bg-white p-8 shadow-sm sm:w-[calc(50%-12px)] lg:w-[calc((100%-48px)/3)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="grid size-[50px] place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
                    {item.name.charAt(0)}
                  </span>
                  <figcaption>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-ink/50">{item.city}</p>
                  </figcaption>
                </div>
                <p className="flex items-center gap-1 text-sm font-semibold">
                  {item.rating}
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                </p>
              </div>
              <blockquote className="mt-6 text-base leading-8 text-ink/70">“{item.quote}”</blockquote>
            </figure>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {Array.from({ length: last + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-[15px] rounded-full transition-all ${
                  i === index ? "w-[45px] bg-brand-600" : "w-[15px] bg-line hover:bg-brand-300"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Previous testimonials"
              disabled={index === 0 && !atEnd}
              onClick={() => go(index - 1)}
              className="grid size-[42px] place-items-center rounded-full border border-line transition hover:border-brand-600 hover:text-brand-600 disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next testimonials"
              disabled={atEnd}
              onClick={() => go(index + 1)}
              className="grid size-[42px] place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
