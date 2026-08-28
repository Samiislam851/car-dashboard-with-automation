"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Category } from "@/lib/data";
import { useVehicles } from "@/lib/vehicles";
import { useBooking } from "./booking-context";
import { CarCard } from "./car-card";
import { SectionHeading } from "./section-heading";

const PAGE = 4;

export function RentalDeals() {
  const [tab, setTab] = useState<Category>("popular");
  const [visible, setVisible] = useState(PAGE);
  const [liked, setLiked] = useState<string[]>([]);
  const { selectCar } = useBooking();
  const { data: allCars, error, isLoading } = useVehicles();

  const cars = useMemo(
    () => (allCars ?? []).filter((car) => car.category.includes(tab)),
    [allCars, tab],
  );
  const shown = cars.slice(0, visible);

  const pickTab = (next: Category) => {
    setTab(next);
    setVisible(PAGE);
  };

  const toggleLike = (id: string) =>
    setLiked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <section id="rental-deals" className="scroll-mt-24 bg-surface py-24">
      <div className="container-page">
        <SectionHeading
          title="Most popular car rental deals"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div
          role="tablist"
          aria-label="Car categories"
          className="mt-14 flex gap-2 overflow-x-auto border-b border-line pb-px"
        >
          {CATEGORIES.map((category) => {
            const active = category.id === tab;
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={active}
                onClick={() => pickTab(category.id)}
                className={`shrink-0 border-b-[3px] px-6 pb-4 text-lg tracking-tight transition ${
                  active
                    ? "border-brand-600 font-semibold text-ink"
                    : "border-transparent font-medium text-ink/50 hover:text-ink"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="mt-14 text-center text-sm font-medium text-muted">Loading cars…</p>
        ) : error ? (
          <p className="mt-14 text-center text-sm font-medium text-red-600">
            Couldn&apos;t load cars right now. Please try again shortly.
          </p>
        ) : cars.length === 0 ? (
          <p className="mt-14 text-center text-sm font-medium text-muted">
            No cars in this category yet.
          </p>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {shown.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  liked={liked.includes(car.id)}
                  onToggleLike={toggleLike}
                  onRent={selectCar}
                />
              ))}
            </div>

            <div className="relative mt-12 flex flex-col-reverse items-center justify-center gap-4 sm:flex-row">
              {visible < cars.length ? (
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="rounded-md bg-brand-600 px-8 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
                >
                  Show more car
                </button>
              ) : (
                <p className="text-sm font-medium text-muted">That&apos;s every car in this category</p>
              )}
              <p className="text-sm font-medium text-muted sm:absolute sm:right-5">
                {shown.length} of {cars.length} cars
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
