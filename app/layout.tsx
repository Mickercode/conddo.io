import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import { PwaBootstrap } from "@/components/app/PwaBootstrap";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Conddo.io",
  description: "Your business — website, operations, and marketing — in one place.",
  icons: {
    icon: "/conddo_icon.png",
    apple: "/conddo_icon.png",       // iOS Home Screen icon (touch icon)
  },
  // iOS-only "Add to Home Screen" web-app metadata. Chrome/Android + desktop
  // pull from manifest.ts; Safari still needs these.
  appleWebApp: {
    capable: true,
    title: "Conddo",
    statusBarStyle: "default",
  },
  applicationName: "Conddo",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#7C5CBF",   // matches manifest.theme_color (brand violet)
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",     // respects iPhone safe areas in standalone mode
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        {/* Registers the service worker + tracks the beforeinstallprompt event
            so any <InstallAppButton> elsewhere on the page can fire prompt(). */}
        <PwaBootstrap />
      </body>
    </html>
  );
}
