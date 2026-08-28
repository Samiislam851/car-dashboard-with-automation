"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#rental-deals", label: "Rental Details" },
  { href: "/#why-us", label: "Why Choose Us" },
  { href: "/#testimonial", label: "Testimonial" },
];

export function Header({
  isAuthenticated = false,
  isAdmin = false,
  overlay = false,
}: {
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  /** Sit transparently over a hero image until the page is scrolled. */
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // Dismiss the mobile menu when tapping anywhere outside the header.
  useEffect(() => {
    if (!open) return;
    const onOutside = (event: Event) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    // Both events so it works with a mouse and with touch.
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  // Transparent only at the very top of a hero page, and only where the desktop nav shows.
  const transparent = overlay && !scrolled;

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Drop the cached session so auth-aware widgets hide immediately.
    await mutate("/api/auth/me");
    setLoggingOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-40 transition-colors ${
        transparent
          ? "border-b border-transparent bg-white/85 backdrop-blur lg:bg-transparent lg:backdrop-blur-none"
          : "border-b border-line/80 bg-white/85 backdrop-blur"
      }`}
    >
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
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-md border border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
                >
                  <LayoutDashboard size={16} />
                  Go to admin panel
                </Link>
              )}
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

      {/*
        Absolute + top-full drops the menu below the bar without adding to the header's height,
        so it overlays the page instead of pushing the content underneath it down.
      */}
      {open && (
        <nav className="absolute inset-x-0 top-full animate-slide-down border-t border-line bg-white shadow-lg lg:hidden">
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
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-600 py-2.5 text-sm font-semibold text-brand-600"
                  >
                    <LayoutDashboard size={16} />
                    Go to admin panel
                  </Link>
                )}
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
