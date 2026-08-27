import { CalendarDays, CarFront, MapPin } from "lucide-react";
import { STEPS } from "@/lib/data";
import { SectionHeading } from "./section-heading";

const ICONS = [MapPin, CalendarDays, CarFront];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24">
      <div className="container-page">
        <SectionHeading
          title="How it works"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div className="relative mt-16 grid gap-12 md:grid-cols-3">
          {/* dashed connector, as in the wireframe */}
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[53px] hidden border-t-2 border-dashed border-brand-300/60 md:block"
          />
          {STEPS.map((step, i) => {
            const Icon = ICONS[i];
            return (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto grid size-[106px] place-items-center rounded-[30px] bg-brand-50 text-brand-600">
                  <Icon size={44} strokeWidth={1.6} />
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mx-auto mt-4 max-w-[277px] text-sm leading-7 text-ink/60">{step.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
