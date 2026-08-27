/** Side-view car illustration. The Figma wireframe only had a grey placeholder here. */
export function CarArt({ tint = "#fe9f43", className }: { tint?: string; className?: string }) {
  return (
    <svg viewBox="0 0 320 140" className={className} role="img" aria-label="Car illustration">
      <ellipse cx="160" cy="128" rx="142" ry="8" fill="currentColor" opacity="0.1" />

      {/* body */}
      <path
        d="M12 104c-5 0-9-4-9-9V80c0-11 8-20 19-22l38-7 40-27c8-6 17-9 27-9h55c13 0 25 6 33 16l19 24 44 8c12 2 21 13 21 25v7c0 5-4 9-9 9H12Z"
        fill={tint}
      />
      {/* glass */}
      <path d="M112 22h34v29H70l42-29Z" fill="#fff" opacity="0.9" />
      <path d="M156 22h35c8 0 15 3 20 10l14 19h-69V22Z" fill="#fff" opacity="0.9" />
      {/* trim */}
      <rect x="3" y="86" width="314" height="7" fill="#000" opacity="0.12" />
      <rect x="276" y="62" width="30" height="8" rx="4" fill="#fff" opacity="0.55" />

      {/* wheels */}
      <g fill="#1a202c">
        <circle cx="84" cy="104" r="24" />
        <circle cx="238" cy="104" r="24" />
      </g>
      <g fill="#e2e8f0">
        <circle cx="84" cy="104" r="10" />
        <circle cx="238" cy="104" r="10" />
      </g>
    </svg>
  );
}
