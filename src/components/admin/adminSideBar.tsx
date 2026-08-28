"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

// Only these items carry a trailing expand indicator in the design; every other row is a plain link.
const ITEMS_WITH_INDICATOR = new Set(["Sales", "POS"]);

function slugify(label: string) {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const AdminSideBar = ({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 h-screen shrink-0 overflow-hidden border-r border-admin-border bg-white transition-[width] duration-300 ease-in-out md:static ${
        open ? "w-[252px]" : "w-0 border-r-0"
      }`}
    >
      <div className="flex h-screen w-[252px] flex-col font-nunito">
        <Link href="/admin" className="flex h-[65px] shrink-0 items-center border-b border-admin-border px-4 py-2.5">
          <span className="relative block h-9 w-[114.545px] shrink-0">
            <Image src="/admin/images/logo.png" alt="Best Car" fill sizes="115px" className="object-cover" />
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
                    const href = `/admin/${section.slug}/${slugify(item)}`;
                    const active = pathname === href;
                    const icon = ITEM_ICONS[item];

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
                            {icon && <img src={icon} alt="" className="size-4 shrink-0" />}
                            <span
                              className={`truncate text-sm leading-[21px] font-medium ${
                                active ? "text-admin-primary" : "text-admin-grey-900"
                              }`}
                            >
                              {item}
                            </span>
                          </span>
                          {ITEMS_WITH_INDICATOR.has(item) && (
                            <img src="/admin/icons/chevron-right-badge.svg" alt="" className="size-4 shrink-0" />
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
      </div>
    </aside>
  );
};

export default AdminSideBar;
