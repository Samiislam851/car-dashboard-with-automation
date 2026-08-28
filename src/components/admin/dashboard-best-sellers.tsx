"use client";

import { DashboardCard, CardState, LightButton } from "./dashboard-card";
import { moneyShort, compactNumber, useDashboard, type BestSeller } from "@/lib/dashboard";

export function DashboardBestSellers() {
  const { data, error, isLoading } = useDashboard<BestSeller[]>("best-sellers");

  return (
    <DashboardCard title="Best Seller" action={<LightButton />}>
      <CardState isLoading={isLoading} error={error} isEmpty={!data?.length} />

      {data?.length ? (
        <ul className="flex flex-col gap-2 p-5">
          {data.map((item) => (
            <li key={item.vehicleId} className="flex items-center gap-2 p-[5px]">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-admin-thumb">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="size-full object-cover" />
                ) : null}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-[14px] leading-[21px] font-bold text-admin-grey-900">{item.name}</p>
                <p className="text-[12px] leading-[18px] text-admin-muted">{moneyShort(item.pricePerDay)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-[5px] text-right">
                <span className="text-[14px] leading-[21px] text-admin-muted">Sales</span>
                <span className="text-[14px] leading-[21px] font-medium text-admin-grey-900">
                  {compactNumber(item.sales)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardCard>
  );
}
