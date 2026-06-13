"use client";

import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/** Cross-route transition. Wraps the entire app's children with a
 *  motion.div keyed by pathname so React tears down + remounts on
 *  every navigation, giving us a clean entrance animation per route.
 *
 *  We use entrance-only (no AnimatePresence + exit) deliberately —
 *  Next.js App Router's render scheduler doesn't reliably hold the
 *  previous route long enough for an exit animation to complete,
 *  and chasing the edge cases is more trouble than it's worth.
 *
 *  Entrance is a quick fade + 8px slide-up at the spring tail. Subtle
 *  on purpose: most routes do their own internal motion (the marketing
 *  hero's floating shapes, the auth shell's stagger, the bento cells'
 *  whileInView), so a heavier global transition would compete. */
export function CinematicTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
