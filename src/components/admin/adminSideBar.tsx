"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutGrid, LogOut, UserPen, type LucideIcon } from "lucide-react";
import { ADMIN_SIDEBAR_DETAILS } from "@/lib/data";

const ITEM_ICONS: Record<string, string> = {
  Products: "/admin/icons/box.svg",
  "Create Product": "/admin/icons/table-plus.svg",
  "Expired Products": "/admin/icons/progress-alert.svg",
  "Low Stocks": "/admin/icons/trending-up-2.svg",
  Category: "/admin/icons/list-details.svg",
  "Sub Category": "/admin/icons/carousel-vertical.svg",
  Brands: "/admin/icons/triangles.svg",
  Units: "/admin/icons/brand-unity.svg",
  "Variant Attributes": "/admin/icons/checklist.svg",
  Warranties: "/admin/icons/certificate.svg",
  "Print Barcode": "/admin/icons/barcode.svg",
  "Print QR Code": "/admin/icons/qrcode.svg",
  "Manage Stock": "/admin/icons/stack-3.svg",
  "Stock Adjustment": "/admin/icons/stairs-up.svg",
  "Stock Transfer": "/admin/icons/stack-pop.svg",
  Sales: "/admin/icons/shopping-cart.svg",
  Invoices: "/admin/icons/file-invoice.svg",
  "Sales Return": "/admin/icons/receipt-refund.svg",
  Quotation: "/admin/icons/files.svg",
  POS: "/admin/icons/device-laptop.svg",
};

const LUCIDE_ITEM_ICONS: Record<string, LucideIcon> = {
  Dashboard: LayoutGrid,
  "Super Admin": UserPen,
};

// Only these items carry a trailing expand indicator in the design; every other row is a plain link.
const ITEMS_WITH_INDICATOR = new Set(["Sales", "POS", "Super Admin"]);

function slugify(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const AdminSideBar = ({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    onNavigate?.();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen shrink-0 overflow-hidden border-r border-admin-border bg-white transition-[width] duration-300 ease-in-out md:static ${
        open ? "w-[252px]" : "w-0 border-r-0"
      }`}
    >
      <div className="flex h-screen w-[252px] flex-col font-nunito">
        <Link href="/admin" className="flex h-[65px] shrink-0 items-center border-b border-admin-border px-4 py-2.5">
          <span className="relative block h-9 w-[114.545px] shrink-0">
            <Image src="/logo.png" alt="Best Car" fill sizes="115px" className="object-cover" />
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {ADMIN_SIDEBAR_DETAILS.map((section, index) => (
            <div key={section.slug} className="flex flex-col gap-4">
              {index > 0 && <div className="h-px w-full bg-admin-border" />}

              <div className="flex flex-col gap-2">
                <p className="text-[12px] leading-[18px] font-bold text-admin-secondary">{section.label}</p>

                <ul className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const isDashboard = section.slug === "main" && item === "Dashboard";
                    const href = isDashboard ? "/admin" : `/admin/${section.slug}/${slugify(item)}`;
                    const active = isDashboard ? pathname === "/admin" : pathname === href;
                    const icon = ITEM_ICONS[item];
                    const LucideItemIcon = LUCIDE_ITEM_ICONS[item];

                    return (
                      <li key={item}>
                        <Link
                          href={href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={`flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 transition-colors ${
                            active ? "bg-admin-primary-50" : "hover:bg-admin-surface"
                          }`}
                        >
                          <span className="flex flex-1 items-center gap-2 min-w-0">
                            {LucideItemIcon ? (
                              <LucideItemIcon
                                className={`size-4 shrink-0 ${active ? "text-admin-primary" : "text-admin-grey-600"}`}
                              />
                            ) : (
                              icon && <img src={icon} alt="" className="size-4 shrink-0" />
                            )}
                            <span
                              className={`truncate text-sm leading-[21px] font-medium ${
                                active ? "text-admin-primary" : "text-admin-grey-900"
                              }`}
                            >
                              {item}
                            </span>
                          </span>
                          {isDashboard ? (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-admin-primary/15">
                              <ChevronDown className="size-3 text-admin-primary" />
                            </span>
                          ) : (
                            ITEMS_WITH_INDICATOR.has(item) && (
                              <img src="/admin/icons/chevron-right-badge.svg" alt="" className="size-4 shrink-0" />
                            )
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-admin-border p-6">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-admin-grey-900 transition-colors hover:bg-admin-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="size-4 shrink-0" />
            <span>{loggingOut ? "Logging out…" : "Log Out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSideBar;
