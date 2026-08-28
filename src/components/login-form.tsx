"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-line px-4 py-2.5 text-sm text-ink outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-bold">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-sm text-ink/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
