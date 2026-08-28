"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STORES = ["Coming Soon", "Downtown Branch", "Airport Branch", "Warehouse 2"];

const AdminTopbar = () => {
  const [store, setStore] = useState(STORES[0]);
  const [storeOpen, setStoreOpen] = useState(false);
  const storeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!storeOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(e.target as Node)) {
        setStoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [storeOpen]);

  // ⌘K on macOS / Ctrl+K elsewhere jumps to the search field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="relative flex h-[65px] shrink-0 items-center justify-between gap-2.5 border-b border-admin-border bg-white px-6 py-[9px] font-nunito">
      <div className="flex min-w-0 flex-1 shrink items-center gap-2 rounded-lg border border-admin-border bg-white p-2 xl:w-[229px] xl:flex-none">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <img src="/admin/icons/search.svg" alt="" className="size-3.5 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search"
            aria-keyshortcuts="Meta+K Control+K"
            onKeyDown={(event) => event.key === "Escape" && event.currentTarget.blur()}
            className="w-full min-w-0 truncate bg-transparent text-[13px] leading-[19.5px] text-admin-grey-900 placeholder:text-admin-grey-300 outline-none"
          />
        </div>
        <button
          type="button"
          aria-label="Focus search"
          onClick={() => searchRef.current?.focus()}
          className="hidden shrink-0 cursor-pointer items-center gap-1 rounded-[5px] bg-admin-border p-1 transition hover:brightness-95 xl:flex"
        >
          <img src="/admin/icons/command.svg" alt="" className="size-2.5" />
          <span className="text-[10px] leading-[15px] font-medium text-admin-secondary">K</span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div ref={storeRef} className="relative hidden shrink-0 lg:block">
          <button
            type="button"
            onClick={() => setStoreOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={storeOpen}
            className="flex h-[34px] cursor-pointer items-center gap-2 rounded-lg border border-admin-border bg-white px-2 py-1 transition hover:bg-admin-surface"
          >
            <Image src="/admin/images/store-thumb.png" alt="" width={16} height={16} className="size-4 shrink-0 rounded object-cover" />
            <span className="text-sm leading-[21px] whitespace-nowrap text-admin-grey-900">{store}</span>
            <img
              src="/admin/icons/caret-down.svg"
              alt=""
              className={`h-[3.5px] w-[7px] transition-transform ${storeOpen ? "rotate-180" : ""}`}
            />
          </button>

          {storeOpen && (
            <ul
              role="listbox"
              className="absolute top-[calc(100%+6px)] right-0 z-50 w-[200px] overflow-hidden rounded-lg border border-admin-border bg-white py-1 shadow-lg"
            >
              {STORES.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option === store}
                    onClick={() => {
                      setStore(option);
                      setStoreOpen(false);
                    }}
                    className={`w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-admin-surface ${
                      option === store ? "font-medium text-admin-primary" : "text-admin-grey-900"
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-[5px] bg-admin-primary px-3 py-[7px] text-[13px] leading-[19.5px] font-medium text-white transition hover:brightness-95"
          >
            <img src="/admin/icons/circle-plus.svg" alt="" className="size-[13px]" />
            <span className="hidden xl:inline">Add New</span>
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1 rounded-[5px] bg-admin-secondary px-3 py-[7px] text-[13px] leading-[19.5px] font-medium text-white transition hover:brightness-110"
          >
            <img src="/admin/icons/device-laptop-header.svg" alt="" className="size-[13px]" />
            <span className="hidden xl:inline">POS</span>
          </button>
        </div>

        <div className="hidden h-full w-px shrink-0 bg-admin-border lg:block" />

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Language"
            className="hidden size-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95 lg:flex"
          >
            <Image src="/admin/images/language-flag.png" alt="" width={16} height={16} className="size-4 object-cover" />
          </button>

          <button
            type="button"
            aria-label="Maximize"
            className="hidden size-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95 lg:flex"
          >
            <img src="/admin/icons/maximize.svg" alt="" className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Mail"
            className="relative hidden size-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95 lg:flex"
          >
            <span className="flex items-center justify-center rounded-lg bg-admin-surface-2 p-2">
              <img src="/admin/icons/mail.svg" alt="" className="size-4" />
            </span>
            <span className="absolute -top-1.5 right-0.5 flex size-[18px] items-center justify-center rounded-full bg-admin-primary text-[10px] leading-[15px] font-semibold text-white">
              01
            </span>
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="flex size-[34px] cursor-pointer items-center justify-center rounded-lg bg-admin-surface-2 transition hover:brightness-95"
          >
            <img src="/admin/icons/bell.svg" alt="" className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Settings"
            className="hidden size-[34px] cursor-pointer items-center justify-center rounded-lg bg-admin-surface-2 transition hover:brightness-95 lg:flex"
          >
            <img src="/admin/icons/settings.svg" alt="" className="size-4" />
          </button>
        </div>

        <Image
          src="/admin/images/avatar.png"
          alt="Super Admin"
          width={34}
          height={34}
          className="size-[34px] shrink-0 rounded-[10px] object-cover"
        />
      </div>
    </header>
  );
};

export default AdminTopbar;
