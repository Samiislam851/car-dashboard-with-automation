/**
 * Unsplash serves its images through an imgix CDN that resizes via query params,
 * so we can build a plain `srcset` the browser fetches directly.
 *
 * This deliberately bypasses `next/image`: that would route every request through
 * `/_next/image`, making our own server download and re-encode the photo on each
 * cold request. On a small Vercel deployment that's the slowest part of the page
 * and it burns the image-optimisation quota for no benefit — Unsplash's CDN
 * already does the resizing for free.
 */
const WIDTHS = [640, 828, 1080, 1440, 1920, 2560];

const base = (src: string) => src.split("?")[0];

const variant = (src: string, width: number) =>
  `${base(src)}?auto=format&fit=crop&q=75&w=${width}`;

/** Default `src` for browsers that ignore `srcset`. */
export const unsplashSrc = (src: string, width = 1600) => variant(src, width);

/** Responsive `srcset`, all served straight from the Unsplash CDN. */
export const unsplashSrcSet = (src: string) =>
  WIDTHS.map((width) => `${variant(src, width)} ${width}w`).join(", ");
