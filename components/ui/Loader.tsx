import Image from "next/image";

/**
 * Branded spinner — the Conddo four-square mark rotating 360°.
 * Used by the route-transition overlay and available for any loading state.
 */
export function Loader({ size = 56 }: { size?: number }) {
  return (
    <Image
      src="/conddo_icon.png"
      alt="Loading"
      width={size}
      height={size}
      priority
      // Continuous 360° spin; honours prefers-reduced-motion.
      className="animate-spin motion-reduce:animate-none"
      style={{ animationDuration: "0.8s" }}
    />
  );
}
