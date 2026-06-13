import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Standard cn() helper: merges classnames with Tailwind conflict resolution
 *  so later utilities win predictably. Used by every 21st.dev component we
 *  pull in and any of our own composable primitives. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
