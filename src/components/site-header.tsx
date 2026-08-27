import { getSessionUser } from "@/lib/session";
import { Header } from "./header";

export async function SiteHeader() {
  const user = await getSessionUser();
  return <Header isAuthenticated={!!user} />;
}
