import type { MetadataRoute } from "next";

// PWA manifest — Next.js serves this at /manifest.webmanifest and auto-injects
// <link rel="manifest">. Combined with the iOS meta tags in layout.tsx and the
// minimal service worker at /sw.js, this is what makes "Install app" appear in
// Chrome/Edge desktop, "Add to Home Screen" work on iOS Safari, and the
// install banner fire on Android Chrome.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conddo.io — Your business, in one place",
    short_name: "Conddo",
    description:
      "Your business — website, customers, orders, bookings, and marketing — in one place. Built for Nigeria.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8F8F6",
    theme_color: "#7C5CBF",
    lang: "en",
    categories: ["business", "productivity", "finance"],
    icons: [
      {
        src: "/conddo_icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/conddo_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Maskable variant — same image; the OS adds its own safe-area padding.
      // Source image is 600x600 with the logo well inside, so it survives the
      // ~40% safe zone trim.
      {
        src: "/conddo_icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
