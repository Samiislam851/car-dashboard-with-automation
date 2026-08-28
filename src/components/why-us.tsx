import { Headset, MapPinned, Tags } from "lucide-react";
import { FEATURES } from "@/lib/data";
import { SectionHeading } from "./section-heading";

const ICONS = [Headset, Tags, MapPinned];
const SUPPORT_IMAGE = "https://images.unsplash.com/photo-1766066014237-00645c74e9c6?q=80&w=600";

export function WhyUs() {
  return (
    <section id="why-us" className="scroll-mt-24 py-24">
      <div className="container-page">
        <SectionHeading
          title="Why choose us"
          subtitle="A high-performing web-based car rental system for any rent-a-car company and website"
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <div
            role="img"
            aria-label="Customer support"
            className="aspect-[4/3] w-full overflow-hidden rounded-[10px] bg-cover bg-center sm:aspect-[16/11]"
            style={{ backgroundImage: `url('${SUPPORT_IMAGE}')` }}
          />

          <ul className="flex flex-col gap-10">
            {FEATURES.map((feature, i) => {
              const Icon = ICONS[i];
              return (
                <li key={feature.title} className="flex gap-6">
                  <span className="grid size-[52px] shrink-0 place-items-center rounded-[10px] bg-brand-50 text-brand-600">
                    <Icon size={26} />
                  </span>
                  <div>
                    <h3 className="text-[22px] font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 max-w-[432px] text-base leading-7 text-ink/60">{feature.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
