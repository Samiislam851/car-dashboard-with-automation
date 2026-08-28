"use client";

import { useState } from "react";
import { CardState, RangeSelect } from "./dashboard-card";
import { compactNumber, useDashboard, type CountrySales, type Summary } from "@/lib/dashboard";

export function DashboardSalesByCountry() {
  const [days, setDays] = useState(7);
  const { data, error, isLoading } = useDashboard<CountrySales[]>("sales-by-country");
  const { data: summary } = useDashboard<Summary>("summary", { days });

  const [activeIndex, setActiveIndex] = useState(0);
  const active = data?.[Math.min(activeIndex, (data?.length ?? 1) - 1)];

  const change = summary?.weeklyChangePercent;
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const isPositive = (change ?? 0) >= 0;

  return (
    <section className="flex w-full flex-col gap-6 rounded-lg border border-admin-stroke/30 bg-white p-6 shadow-[0_4px_30px_rgba(231,231,231,0.47)] xl:w-[374px] xl:shrink-0">
      <div className="flex items-center gap-6">
        <h2 className="flex-1 text-[18px] leading-[21px] font-bold text-admin-grey-900">Sales by Countries</h2>
        <RangeSelect value={days} onChange={setDays} />
      </div>

      <CardState isLoading={isLoading} error={error} isEmpty={!data?.length} rows={3} />

      {data?.length ? (
        <>
          <div className="relative w-full">
            <img src="/admin/icons/world-map.svg" alt="World map" className="w-full" />

            {active ? (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg shadow-[0_4px_30px_rgba(231,231,231,0.47)]">
                <p className="bg-admin-primary px-[30px] py-2.5 text-center text-[14px] leading-[18px] font-bold text-white">
                  {active.country}
                </p>
                <p className="bg-white px-[30px] py-2.5 text-center text-[14px] leading-[21px] font-medium text-admin-grey-900">
                  {compactNumber(active.sales)} Sales
                </p>
              </div>
            ) : null}
          </div>

          {/* Country picker — the map art is flat, so this drives which country the tooltip shows. */}
          <div className="flex flex-wrap justify-center gap-1.5">
            {data.slice(0, 6).map((row, index) => (
              <button
                key={row.country}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                className={`cursor-pointer rounded-[5px] px-2 py-1 text-[12px] leading-[18px] transition ${
                  index === activeIndex
                    ? "bg-admin-primary text-white"
                    : "border border-admin-border text-admin-muted hover:bg-admin-surface"
                }`}
              >
                {row.country}
              </button>
            ))}
          </div>

          <p className="flex items-center justify-center gap-[5px] text-[14px] text-admin-grey-600">
            {hasChange ? (
              <>
                <img
                  src="/admin/icons/trend-up.svg"
                  alt=""
                  className={`h-1.5 w-[11px] shrink-0 ${isPositive ? "" : "rotate-180"}`}
                />
                <span>
                  <span className={`font-bold ${isPositive ? "text-admin-success" : "text-red-500"}`}>
                    {Math.abs(change).toFixed(1)}%
                  </span>{" "}
                  {isPositive ? "increase" : "decrease"} compare to last week
                </span>
              </>
            ) : (
              <span>Across {data.length} countries</span>
            )}
          </p>
        </>
      ) : null}
    </section>
  );
}
