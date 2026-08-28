"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#rental-deals", label: "Rental Details" },
  { href: "/#why-us", label: "Why Choose Us" },
  { href: "/#testimonial", label: "Testimonial" },
];

export function Header({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setLoggingOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between gap-6">
        <Link href="/#home" aria-label="Best Car — home" className="shrink-0">
          {/* Square source with transparent margins, so it's cropped to the wordmark like the admin sidebar. */}
          <span className="relative block h-10 w-[127px]">
            <Image src="/logo.png" alt="Best Car" fill sizes="127px" priority className="object-cover" />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink/70 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/bookings"
                className="text-[15px] font-medium text-ink/70 transition-colors hover:text-brand-600"
              >
                My Bookings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                <LogOut size={16} />
                {loggingOut ? "Logging out…" : "Log Out"}
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="text-[15px] font-medium text-ink/70 underline-offset-4 hover:underline">
                Register
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Log In
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="rounded-md border border-line p-2 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-white lg:hidden">
          <div className="container-page flex flex-col py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium text-ink/80"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  href="/bookings"
                  onClick={() => setOpen(false)}
                  className="py-3 text-[15px] font-medium text-ink/80"
                >
                  My Bookings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <LogOut size={16} />
                  {loggingOut ? "Logging out…" : "Log Out"}
                </button>
              </>
            ) : (
              <div className="flex gap-3 py-3">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-line py-2.5 text-center text-sm font-semibold"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md bg-brand-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
