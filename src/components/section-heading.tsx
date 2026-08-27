export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-[530px] text-center">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[48px] lg:leading-[1.2]">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-relaxed text-ink/60">{subtitle}</p>}
    </div>
  );
}
