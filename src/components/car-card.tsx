"use client";

import { Fuel, Heart, Users } from "lucide-react";
import type { Car } from "@/lib/data";
import { CarArt } from "./car-art";

type Props = {
  car: Car;
  liked: boolean;
  onToggleLike: (id: string) => void;
  onRent: (car: Car) => void;
};

export function CarCard({ car, liked, onToggleLike, onRent }: Props) {
  return (
    <article className="group flex flex-col rounded-[10px] border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{car.name}</h3>
          <p className="mt-1 text-sm font-medium text-muted">{car.type}</p>
        </div>
        <button
          type="button"
          aria-label={liked ? `Remove ${car.name} from favourites` : `Add ${car.name} to favourites`}
          aria-pressed={liked}
          onClick={() => onToggleLike(car.id)}
          className="shrink-0 text-muted transition hover:text-red-500"
        >
          <Heart size={22} fill={liked ? "currentColor" : "none"} className={liked ? "text-red-500" : undefined} />
        </button>
      </div>

      <div className="my-8 grid place-items-center px-2">
        {car.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.imageUrl}
            alt={car.name}
            className="h-40 w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <CarArt tint={car.tint} className="w-full transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      <ul className="flex items-center justify-between gap-2 text-sm font-medium text-muted">
        <li className="flex items-center gap-1.5">
          <Fuel size={16} /> {car.fuel}
        </li>
        <li className="flex items-center gap-1.5">{car.gearbox}</li>
        <li className="flex items-center gap-1.5">
          <Users size={16} /> {car.seats}
        </li>
      </ul>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xl font-bold">
          ${car.price.toFixed(2)}
          <span className="text-sm font-medium text-muted">/ day</span>
        </p>
        <button
          type="button"
          onClick={() => onRent(car)}
          className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Rent Now
        </button>
      </div>
    </article>
  );
}
