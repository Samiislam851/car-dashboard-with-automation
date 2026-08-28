"use client";

import { useState } from "react";
import useSWR from "swr";
import { money, compactNumber, RANGES, useDashboard, type Summary } from "@/lib/dashboard";

const meFetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null));

/** Formats the selected window as "01 Jan 2024 - 07 Jan 2024", matching the design. */
function rangeLabel(days: number) {
  const format = (date: Date) =>
    date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return `${format(start)} - ${format(end)}`;
}

export function DashboardWelcome() {
  const [days, setDays] = useState(7);
  const { data: me } = useSWR<{ name?: string } | null>("/api/auth/me", meFetcher, {
    revalidateOnFocus: false,
  });
  const { data: summary, isLoading, mutate } = useDashboard<Summary>("summary", { days });

  const change = summary?.weeklyChangePercent;
  const hasChange = typeof change === "number" && Number.isFinite(change);
  const isPositive = (change ?? 0) >= 0;

  return (
    <section className="flex flex-col gap-6 font-nunito">
      <div className="flex flex-col gap-4 rounded-lg bg-white px-2.5 py-[15px] shadow-[0_4px_60px_rgba(231,231,231,0.47)] lg:flex-row lg:items-center lg:gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <img src="/admin/icons/user-wave.png" alt="" className="size-6 shrink-0" />
          <p className="min-w-0 text-[15px] sm:text-base">
            <span className="text-[18px] leading-[21px] font-bold text-admin-secondary sm:text-[20px]">
              Hi {me?.name ?? "there"},
            </span>{" "}
            <span className="leading-[21px] font-semibold text-admin-grey-600">
              here&apos;s what&apos;s happening with your store today.
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="relative flex h-[38px] items-center gap-[7px] rounded-lg border border-admin-stroke/30 bg-white pr-7 pl-2.5">
            <img src="/admin/icons/calendar.svg" alt="" className="size-4 shrink-0" />
            <span className="text-[13px] leading-[18px] whitespace-nowrap text-admin-secondary sm:text-[15px]">
              {rangeLabel(days)}
            </span>
            <span className="sr-only">Select date range</span>
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="absolute inset-0 cursor-pointer opacity-0"
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
              className="pointer-events-none absolute top-1/2 right-2.5 h-[5px] w-2 -translate-y-1/2"
            />
          </label>
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => mutate()}
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-admin-stroke/30 transition hover:bg-admin-surface"
          >
            <img src="/admin/icons/refresh.svg" alt="" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Expand"
            onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-admin-stroke/30 transition hover:bg-admin-surface"
          >
            <img src="/admin/icons/expand.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-[1fr_261px_261px]">
        <div className="flex items-center gap-5 rounded-lg border border-admin-stroke/30 bg-white p-6 md:col-span-2 xl:col-span-1 xl:h-[133px]">
          <div className="flex flex-1 flex-col gap-5 min-w-0">
            <p className="text-[16px] font-semibold text-admin-primary">Weekly Earning</p>
            <div className="flex flex-col gap-[5px]">
              <p className="text-[24px] leading-[21px] font-bold text-admin-secondary">
                {isLoading ? "—" : money(summary?.weeklyEarning)}
              </p>
              <div className="flex items-center gap-[5px]">
                {hasChange && (
                  <img
                    src="/admin/icons/trend-up.svg"
                    alt=""
                    className={`h-1.5 w-[11px] ${isPositive ? "" : "rotate-180"}`}
                  />
                )}
                <p className="text-sm leading-[21px] text-admin-grey-600">
                  {hasChange ? (
                    <>
                      <span className={`font-bold ${isPositive ? "text-admin-success" : "text-red-500"}`}>
                        {Math.abs(change).toFixed(1)}%
                      </span>{" "}
                      {isPositive ? "increase" : "decrease"}{" "}
                      {days === 7 ? "compare to last week" : "compare to previous period"}
                    </>
                  ) : (
                    "No comparison data for the previous period"
                  )}
                </p>
              </div>
            </div>
          </div>
          <img src="/admin/images/weekly-earning.png" alt="" width={80} height={80} className="size-20 shrink-0" />
        </div>

        <div className="relative flex h-[133px] flex-col justify-center gap-[15px] rounded-lg bg-admin-warning p-6">
          <img src="/admin/icons/sales-icon.svg" alt="" className="size-[45px]" />
          <div className="flex flex-col gap-[5px] text-white">
            <p className="text-[24px] leading-[21px] font-bold">
              {isLoading ? "—" : compactNumber(summary?.totalSales)}
            </p>
            <p className="text-[15px] leading-[18px]">No of Total Sales</p>
          </div>
          <img src="/admin/icons/card-corner-1.svg" alt="" className="absolute top-[11px] right-[24px] size-4" />
        </div>

        <div className="relative flex h-[133px] flex-col justify-center gap-[15px] rounded-lg bg-admin-secondary p-6">
          <img src="/admin/icons/purchased-icon.svg" alt="" className="size-[45px]" />
          <div className="flex flex-col gap-[5px] text-white">
            <p className="text-[24px] leading-[21px] font-bold">
              {isLoading ? "—" : compactNumber(summary?.purchasedGoods)}
            </p>
            <p className="text-[15px] leading-[18px]">No of Purchased Goods</p>
          </div>
          <img src="/admin/icons/card-corner-2.svg" alt="" className="absolute top-[14px] right-[24px] size-4" />
        </div>
      </div>
    </section>
  );
}
