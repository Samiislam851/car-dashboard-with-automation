import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Register — Best Car",
  description: "Create a Best Car account to book and manage your car rentals.",
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-surface py-16 sm:py-24">
        <div className="container-page flex justify-center">
          <div className="w-full max-w-md rounded-[10px] bg-white p-8 shadow-[0_4px_24px_rgba(15,23,42,0.08)] sm:p-10">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-ink/60">
              Join Best Car to book cars faster and track your rentals.
            </p>

            <div className="mt-8">
              <RegisterForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
