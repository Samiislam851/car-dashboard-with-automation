Car rental customer front-end, built from the Figma wireframe in
`docs/figma-frontend-spec.md` (Technical Assessment Task — Digital Pylot, part 2).

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Yarn.

## Getting Started

This project uses [Yarn](https://classic.yarnpkg.com/) as its package manager.

Install dependencies:

```bash
yarn install
```

Then run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure

```
src/app/page.tsx           composes the landing page sections
src/components/            one file per section + shared pieces
  booking-context.tsx      trip + selected-car state shared by search and cards
  search-bar.tsx           pick-up / drop-off rental search interface
  rental-deals.tsx         category tabs, car grid, show-more
  car-card.tsx             vehicle card (favourite, specs, Rent Now)
  booking-modal.tsx        booking summary dialog
src/lib/data.ts            mock fleet, cities, steps, features, testimonials
docs/figma-frontend-spec.md  captured Figma wireframe spec (sections, copy, tokens)
```

## Sections and interactions

Nav (mobile drawer) · hero · pick-up / drop-off search (city, date, time, swap,
search scrolls to results) · how it works · popular deals (category tabs,
favourites, show more, `Rent Now` opens a booking summary that reflects the search)
· why choose us · promos · testimonial carousel (drag/arrows/dots) · footer.

Layout is responsive at mobile, tablet and desktop breakpoints.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
