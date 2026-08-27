import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

const COLUMNS = [
  { title: "About", links: ["How it works", "Featured", "Partnership", "Business Relation"] },
  { title: "Community", links: ["Events", "Blog", "Podcast", "Invite a friend"] },
  { title: "Socials", links: ["Discord", "Instagram", "Twitter", "Facebook"] },
];

const SOCIALS = [
  { Icon: FaFacebookF, label: "Facebook" },
  { Icon: FaXTwitter, label: "Twitter" },
  { Icon: FaInstagram, label: "Instagram" },
];

export function Footer() {
  return (
    <footer className="bg-surface pt-20">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[292px_1fr]">
          <div>
            <p className="text-2xl font-extrabold tracking-tight">
              Best<span className="text-brand-600">Auto</span>
            </p>
            <p className="mt-5 max-w-[292px] text-base leading-relaxed text-ink/60">
              Our vision is to provide convenience and help increase your sales business.
            </p>
            <div className="mt-7 flex gap-4">
              {SOCIALS.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-[34px] place-items-center rounded-full bg-white text-ink/70 shadow-sm transition hover:bg-brand-600 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-xl font-semibold tracking-tight">{column.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-base text-ink/60 transition hover:text-brand-600">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line py-8 text-base font-semibold sm:flex-row sm:items-center sm:justify-between">
          <p>©2026 Best Auto. All rights reserved</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-brand-600">Privacy &amp; Policy</a>
            <a href="#" className="hover:text-brand-600">Terms &amp; Condition</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
