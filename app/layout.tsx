import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { RouteTransition } from "@/components/RouteTransition";
import { ToastProvider } from "@/components/ui/Toast";
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
  icons: { icon: "/conddo_icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <ToastProvider>
          {children}
          <RouteTransition />
        </ToastProvider>
      </body>
    </html>
  );
}
