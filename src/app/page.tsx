import { BookingModal } from "@/components/booking-modal";
import { BookingProvider } from "@/components/booking-context";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Promo } from "@/components/promo";
import { RentalDeals } from "@/components/rental-deals";
import { SearchBar } from "@/components/search-bar";
import { Testimonials } from "@/components/testimonials";
import { WhyUs } from "@/components/why-us";

export default function Home() {
  return (
    <BookingProvider>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <SearchBar />
        <HowItWorks />
        <RentalDeals />
        <WhyUs />
        <Promo />
        <Testimonials />
      </main>
      <Footer />
      <BookingModal />
    </BookingProvider>
  );
}
