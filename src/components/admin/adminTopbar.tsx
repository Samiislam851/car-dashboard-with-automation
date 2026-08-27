"use client";

import Image from "next/image";

const AdminTopbar = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  return (
    <header className="relative flex h-[65px] shrink-0 items-center gap-2.5 border-b border-admin-border bg-white px-6 py-2.5 font-nunito">
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        aria-expanded={open}
        className="absolute top-[22px] left-[-10px] z-50 flex size-5 items-center justify-center rounded-[10px] bg-admin-primary transition-transform duration-300 ease-in-out hover:brightness-95"
      >
        <img
          src="/admin/icons/sidebar-toggle-left.svg"
          alt=""
          className={`size-4 transition-transform duration-300 ${open ? "" : "rotate-180"}`}
        />
      </button>

      <div className="flex w-[229px] shrink-0 items-center gap-2 rounded-lg border border-admin-border bg-white p-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <img src="/admin/icons/search.svg" alt="" className="size-3.5 shrink-0" />
          <span className="truncate text-[13px] leading-[19.5px] text-admin-grey-300">Search</span>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-[5px] bg-admin-border p-1">
          <img src="/admin/icons/command.svg" alt="" className="size-2.5" />
          <span className="text-[10px] leading-[15px] font-medium text-admin-secondary">K</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3 min-w-0">
        <div className="flex h-[34px] shrink-0 items-center gap-2 rounded-lg border border-admin-border bg-white px-2 py-1">
          <Image src="/admin/images/store-thumb.png" alt="" width={16} height={16} className="size-4 shrink-0 rounded object-cover" />
          <span className="text-sm leading-[21px] text-admin-grey-900">Coming Soon</span>
          <img src="/admin/icons/caret-down.svg" alt="" className="h-[3.5px] w-[7px]" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1 rounded-[5px] bg-admin-primary px-3 py-[7px] text-[13px] leading-[19.5px] font-medium text-white transition hover:brightness-95"
          >
            <img src="/admin/icons/circle-plus.svg" alt="" className="size-[13px]" />
            Add New
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-[5px] bg-admin-secondary px-3 py-[7px] text-[13px] leading-[19.5px] font-medium text-white transition hover:brightness-110"
          >
            <img src="/admin/icons/device-laptop-header.svg" alt="" className="size-[13px]" />
            POS
          </button>
        </div>

        <div className="h-full w-px shrink-0 bg-admin-border" />

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Language"
            className="flex size-[34px] items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95"
          >
            <Image src="/admin/images/language-flag.png" alt="" width={16} height={16} className="size-4 object-cover" />
          </button>

          <button
            type="button"
            aria-label="Maximize"
            className="flex size-[34px] items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95"
          >
            <img src="/admin/icons/maximize.svg" alt="" className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Mail"
            className="relative flex size-[34px] items-center justify-center rounded-[10px] bg-admin-surface transition hover:brightness-95"
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
            className="flex size-[34px] items-center justify-center rounded-lg bg-admin-surface-2 transition hover:brightness-95"
          >
            <img src="/admin/icons/bell.svg" alt="" className="size-4" />
          </button>

          <button
            type="button"
            aria-label="Settings"
            className="flex size-[34px] items-center justify-center rounded-lg bg-admin-surface-2 transition hover:brightness-95"
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
