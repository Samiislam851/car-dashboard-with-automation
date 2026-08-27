"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import AdminSideBar from "./adminSideBar";
import AdminTopbar from "./adminTopbar";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

const AdminShell = ({ children, className }: { children: ReactNode; className?: string }) => {
  const isMobile = useIsMobile();
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const open = openOverride ?? !isMobile;

  return (
    <div className={`relative flex h-screen ${className ?? ""}`}>
      <AdminSideBar open={open} onNavigate={() => isMobile && setOpenOverride(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto bg-surface p-4 md:p-6">{children}</main>
      </div>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpenOverride(false)}
          className="fixed inset-0 z-30 bg-admin-secondary/40 md:hidden"
        />
      )}

      <button
        type="button"
        onClick={() => setOpenOverride(!open)}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={open}
        className={`absolute top-[22px] z-50 flex size-5 cursor-pointer items-center justify-center rounded-[10px] bg-admin-primary transition-[left] duration-300 ease-in-out hover:brightness-95 ${
          open ? "left-[242px]" : "left-[10px]"
        }`}
      >
        <img
          src="/admin/icons/sidebar-toggle-left.svg"
          alt=""
          className={`size-4 transition-transform duration-300 ${open ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
};

export default AdminShell;
