"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardCard, CardState } from "./dashboard-card";
import { money, MONTHS, useDashboard, type MonthlySales } from "@/lib/dashboard";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - i);

export function DashboardSalesAnalytics() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const { data, error, isLoading } = useDashboard<MonthlySales[]>("sales-analytics", { year });

  const chartData = data?.map((point) => ({
    month: MONTHS[point.month - 1],
    total: point.total,
  }));

  return (
    <DashboardCard
      title="Sales Analytics"
      action={
        <label className="flex items-center gap-2 rounded-md border border-admin-stroke/30 px-2.5 py-1.5">
          <img src="/admin/icons/calendar.svg" alt="" className="size-3.5 shrink-0" />
          <span className="sr-only">Select year</span>
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="cursor-pointer bg-transparent text-[13px] font-medium text-admin-grey-600 outline-none"
          >
            {YEARS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      }
      className="flex-1"
    >
      <CardState isLoading={isLoading} error={error} rows={4} />

      {!isLoading && !error && chartData ? (
        <div className="h-[262px] w-full p-4 pr-5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-admin-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-admin-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-admin-stroke)" strokeOpacity={0.2} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-admin-grey-600)", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fill: "var(--color-admin-grey-600)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-admin-primary)", strokeOpacity: 0.3 }}
                formatter={(value) => [money(value), "Sales"] as [string, string]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--color-admin-border)",
                  fontSize: 13,
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-admin-primary)"
                strokeWidth={2}
                fill="url(#salesFill)"
                dot={{ r: 3, fill: "var(--color-admin-primary)" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </DashboardCard>
  );
}
