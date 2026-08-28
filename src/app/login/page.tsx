import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log In — Best Car",
  description: "Log in to your Best Car account to manage your car rentals.",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-surface py-16 sm:py-24">
        <div className="container-page flex justify-center">
          <div className="w-full max-w-md rounded-[10px] bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-ink/60">Log in to continue to your Best Car account.</p>

            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
