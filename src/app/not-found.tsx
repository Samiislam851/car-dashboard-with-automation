import { redirect } from "next/navigation";

/**
 * Root not-found also catches every unmatched URL in the app, so instead of
 * showing a 404 page we send visitors back to the landing page.
 */
export default function NotFound() {
  redirect("/");
}
