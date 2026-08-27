"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#home", label: "Home" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#rental-deals", label: "Rental Details" },
  { href: "#why-us", label: "Why Choose Us" },
  { href: "#testimonial", label: "Testimonial" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur">
      <div className="container-page flex h-[76px] items-center justify-between gap-6">
        <a href="#home" className="text-2xl font-extrabold tracking-tight">
          Best<span className="text-brand-600">Auto</span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-ink/70 transition-colors hover:text-brand-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <a href="#" className="text-[15px] font-medium text-ink/70 underline-offset-4 hover:underline">
            Register
          </a>
          <a
            href="#"
            className="rounded-md bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Log In
          </a>
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
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium text-ink/80"
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 py-3">
              <a href="#" className="flex-1 rounded-md border border-line py-2.5 text-center text-sm font-semibold">
                Register
              </a>
              <a href="#" className="flex-1 rounded-md bg-brand-600 py-2.5 text-center text-sm font-semibold text-white">
                Log In
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
