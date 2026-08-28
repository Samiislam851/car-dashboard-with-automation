"use client";

import { DashboardCard, CardState, LightButton } from "./dashboard-card";
import {
  money,
  relativeTime,
  referenceOf,
  STATUS_BADGE,
  useDashboard,
  type Transaction,
} from "@/lib/dashboard";

const COLUMNS = ["#", "Order Details", "Payment", "Status", "Amount"];

export function DashboardRecentTransactions() {
  const { data, error, isLoading } = useDashboard<Transaction[]>("recent-transactions");

  return (
    <DashboardCard title="Recent Transactions" action={<LightButton />} className="min-w-0">
      <CardState isLoading={isLoading} error={error} isEmpty={!data?.length} />

      {data?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="bg-admin-table-head">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="px-5 py-2.5 text-[14px] font-semibold tracking-[1px] whitespace-nowrap text-admin-grey-900"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row.id}>
                  <td className="px-5 py-2 align-middle text-[14px] leading-[21px] text-admin-muted">
                    {index + 1}
                  </td>
                  <td className="px-5 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-admin-thumb">
                        {row.vehicleImageUrl ? (
                          <img src={row.vehicleImageUrl} alt="" className="size-full object-cover" />
                        ) : null}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] leading-[21px] text-admin-grey-900">{row.vehicleName}</p>
                        <span className="flex items-center gap-1">
                          <img src="/admin/icons/clock.svg" alt="" className="size-3.5 shrink-0" />
                          <span className="text-[12px] leading-[18px] whitespace-nowrap text-admin-muted">
                            {relativeTime(row.createdAt)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2 align-middle">
                    <p className="text-[14px] leading-[21px] whitespace-nowrap text-admin-grey-900">
                      {row.paymentMethod ?? "—"}
                    </p>
                    <p className="text-[14px] leading-[21px] whitespace-nowrap text-admin-info">
                      {referenceOf(row.id)}
                    </p>
                  </td>
                  <td className="px-5 py-2 align-middle">
                    <span
                      className={`inline-flex items-center justify-center gap-1 rounded-[5px] p-1.5 text-[10px] leading-[8px] font-medium text-white capitalize ${
                        STATUS_BADGE[row.status.toLowerCase()] ?? "bg-admin-grey-500"
                      }`}
                    >
                      <img src="/admin/icons/status-dot.svg" alt="" className="size-[5px]" />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-2 align-middle text-[16px] leading-[24px] font-bold whitespace-nowrap text-admin-grey-900">
                    {money(row.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardCard>
  );
}
