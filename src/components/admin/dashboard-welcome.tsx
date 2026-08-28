"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function DashboardWelcome() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setName(data?.name ?? null);
      })
      .catch(() => {
        if (!cancelled) setName(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-6 font-nunito">
      <div className="flex flex-col gap-4 rounded-lg bg-white px-2.5 py-[15px] shadow-[0_4px_60px_rgba(231,231,231,0.47)] sm:flex-row sm:items-center sm:gap-2.5">
        <div className="flex flex-1 items-center gap-2.5 min-w-0">
          <img src="/admin/icons/user-wave.png" alt="" className="size-6 shrink-0" />
          <p className="min-w-0">
            <span className="text-[20px] leading-[21px] font-bold text-admin-secondary">Hi {name ?? "there"},</span>{" "}
            <span className="text-[16px] leading-[21px] font-semibold text-admin-grey-600">
              here&apos;s what&apos;s happening with your store today.
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-[38px] items-center gap-[7px] rounded-lg border border-admin-stroke/30 bg-white px-2.5">
            <img src="/admin/icons/calendar.svg" alt="" className="size-4 shrink-0" />
            <span className="text-[15px] leading-[18px] whitespace-nowrap text-admin-secondary">01 Jan 2024 - 07 Jan 2024</span>
          </div>
          <button
            type="button"
            aria-label="Refresh"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-admin-stroke/30 transition hover:bg-admin-surface"
          >
            <img src="/admin/icons/refresh.svg" alt="" className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Expand"
            className="flex size-[38px] cursor-pointer items-center justify-center rounded-lg border border-admin-stroke/30 transition hover:bg-admin-surface"
          >
            <img src="/admin/icons/expand.svg" alt="" className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-6 lg:flex-row">
        <div className="flex flex-1 items-center gap-5 rounded-lg border border-admin-stroke/30 bg-white p-6 lg:h-[133px]">
          <div className="flex flex-1 flex-col gap-5 min-w-0">
            <p className="text-[16px] font-semibold text-admin-primary">Weekly Earning</p>
            <div className="flex flex-col gap-[5px]">
              <p className="text-[24px] leading-[21px] font-bold text-admin-secondary">$95000.45</p>
              <div className="flex items-center gap-[5px]">
                <img src="/admin/icons/trend-up.svg" alt="" className="h-1.5 w-[11px]" />
                <p className="text-sm leading-[21px] text-admin-grey-600">
                  <span className="font-bold text-admin-success">48%</span> increase compare to last week
                </p>
              </div>
            </div>
          </div>
          <img src="/admin/images/weekly-earning.png" alt="" width={80} height={80} className="size-20 shrink-0" />
        </div>

        <div className="relative flex h-[133px] w-full flex-col justify-center gap-[15px] rounded-lg bg-admin-warning p-6 lg:w-[261px] lg:shrink-0">
          <img src="/admin/icons/sales-icon.svg" alt="" className="size-[45px]" />
          <div className="flex flex-col gap-[5px] text-white">
            <p className="text-[24px] leading-[21px] font-bold">10,000+</p>
            <p className="text-[15px] leading-[18px]">No of Total Sales</p>
          </div>
          <img src="/admin/icons/card-corner-1.svg" alt="" className="absolute top-[11px] right-[24px] size-4" />
        </div>

        <div className="relative flex h-[133px] w-full items-start gap-2 rounded-lg bg-admin-secondary p-6 lg:w-[261px] lg:shrink-0">
          <div className="flex h-full flex-col justify-center gap-[15px]">
            <img src="/admin/icons/purchased-icon.svg" alt="" className="size-[45px]" />
            <div className="flex flex-col gap-[5px] text-white">
              <p className="text-[24px] leading-[21px] font-bold">800+</p>
              <p className="text-[15px] leading-[18px]">No of Purchased Goods</p>
            </div>
          </div>
          <img src="/admin/icons/card-corner-2.svg" alt="" className="absolute top-[14px] right-[24px] size-4" />
        </div>
      </div>
    </section>
  );
}
