import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { BookingsList } from "@/components/bookings-list";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Bookings — Best Car",
  description: "View your car rental bookings.",
};

export default async function BookingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-surface py-16 sm:py-24">
        <div className="container-page">
          <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
          <p className="mt-2 text-sm text-ink/60">
            Your car rental reservations, pulled live from our system.
          </p>
          <div className="mt-8">
            <BookingsList />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
