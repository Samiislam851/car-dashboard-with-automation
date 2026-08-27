"use client";

import { useState, type ReactNode } from "react";
import AdminSideBar from "./adminSideBar";
import AdminTopbar from "./adminTopbar";

const AdminShell = ({ children, className }: { children: ReactNode; className?: string }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={`flex h-screen ${className ?? ""}`}>
      <AdminSideBar open={open} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar open={open} onToggle={() => setOpen((v) => !v)} />
        <main className="flex-1 overflow-y-auto bg-surface p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminShell;
