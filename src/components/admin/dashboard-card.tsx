import type { ReactNode } from "react";
import { RANGES } from "@/lib/dashboard";

export function DashboardCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-lg border border-admin-border bg-white ${className}`}>
      <header className="flex items-center gap-2 border-b border-admin-border px-5 py-[15px]">
        <h2 className="flex-1 text-[18px] leading-[21px] font-bold text-admin-grey-900">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

/** The design's "Light Border Button" — used for the View All links. */
export function LightButton({ children = "View All" }: { children?: ReactNode }) {
  return (
    <button
      type="button"
      className="shrink-0 cursor-pointer rounded-[5px] border border-admin-border px-3 py-1.5 text-[12px] leading-[18px] font-semibold text-admin-grey-900 transition hover:bg-admin-surface"
    >
      {children}
    </button>
  );
}

/** The design's bordered range dropdown ("This Week ⌄"). */
export function RangeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  return (
    <div className="relative shrink-0 rounded-[5px] border border-admin-stroke/32">
      <select
        aria-label="Select range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="cursor-pointer appearance-none bg-transparent py-1.5 pr-7 pl-1.5 text-[14px] leading-[18px] text-admin-grey-600 outline-none"
      >
        {RANGES.map((range) => (
          <option key={range.days} value={range.days}>
            {range.label}
          </option>
        ))}
      </select>
      <img
        src="/admin/icons/chevron-down.svg"
        alt=""
        className="pointer-events-none absolute top-1/2 right-2 h-[5px] w-2 -translate-y-1/2"
      />
    </div>
  );
}

/** Renders skeleton / error / empty placeholders so each section doesn't repeat them. */
export function CardState({
  isLoading,
  error,
  isEmpty,
  rows = 5,
}: {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  rows?: number;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-admin-surface-2" />
        ))}
      </div>
    );
  }
  if (error) {
    return <p className="p-5 text-sm text-red-600">Couldn&apos;t load this data. Please try again.</p>;
  }
  if (isEmpty) {
    return <p className="p-5 text-sm text-admin-grey-600">No data to show yet.</p>;
  }
  return null;
}
