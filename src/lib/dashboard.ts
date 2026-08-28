import useSWR from "swr";

export type Summary = {
  weeklyEarning: number;
  weeklyChangePercent: number | null;
  totalSales: number;
  purchasedGoods: number;
  days: number;
  periodStart: string;
  periodEnd: string;
};

/** Shared range presets for the header selector and the per-card dropdowns. */
export const RANGES = [
  { label: "This Week", days: 7 },
  { label: "Last 14 Days", days: 14 },
  { label: "This Month", days: 30 },
  { label: "This Year", days: 365 },
] as const;

export type RangeLabel = (typeof RANGES)[number]["label"];

export type BestSeller = {
  vehicleId: string;
  name: string;
  imageUrl: string | null;
  pricePerDay: string | null;
  sales: number;
  revenue: string;
};

export type Transaction = {
  id: string;
  vehicleName: string;
  vehicleImageUrl: string | null;
  paymentMethod: string | null;
  status: string;
  price: string | null;
  createdAt: string;
};

export type MonthlySales = { month: number; total: number };

export type CountrySales = { country: string; sales: number; revenue: string };

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

/** Fetches a dashboard endpoint. `query` is appended as a search string when given. */
export function useDashboard<T>(endpoint: string, query?: Record<string, string | number>) {
  const search = query ? `?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))}` : "";
  return useSWR<T>(`/api/admin/dashboard/${endpoint}${search}`, fetcher, {
    revalidateOnFocus: false,
  });
}

/** Prisma serialises Decimal columns as strings — coerce before formatting. */
export const toNumber = (value: unknown) => Number(value ?? 0);

export const money = (value: unknown) =>
  toNumber(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/** Whole-dollar variant — the design prints prices as "$260", without cents. */
export const moneyShort = (value: unknown) =>
  toNumber(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const compactNumber = (value: unknown) => toNumber(value).toLocaleString("en-US");

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "long" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60],
  ["month", 30 * 24 * 60],
  ["day", 24 * 60],
  ["hour", 60],
  ["minute", 1],
];

/** "15 minutes ago" style label used by the transactions list. */
export function relativeTime(iso: string) {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  for (const [unit, minutes] of UNITS) {
    if (diffMinutes >= minutes) return RELATIVE.format(-Math.floor(diffMinutes / minutes), unit);
  }
  return "just now";
}

/** Short, stable reference derived from the booking id — mirrors the design's "#4166454..." line. */
export const referenceOf = (id: string) => `#${id.replace(/-/g, "").slice(0, 12).toUpperCase()}`;

/** Filled status badge colours, taken from the Figma system palette. */
export const STATUS_BADGE: Record<string, string> = {
  success: "bg-admin-badge-success",
  completed: "bg-admin-badge-success",
  paid: "bg-admin-badge-success",
  pending: "bg-admin-badge-pending",
  processing: "bg-admin-badge-pending",
  cancelled: "bg-admin-badge-danger",
  canceled: "bg-admin-badge-danger",
  failed: "bg-admin-badge-danger",
};
