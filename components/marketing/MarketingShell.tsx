import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/** Wraps every marketing route with the shared Nav + Footer so each page
 *  doesn't have to repeat the chrome. Pages render their own sections inside
 *  `<main>` and that's it — no layout decisions at the page level. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
