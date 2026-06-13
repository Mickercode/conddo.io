import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { HowConddoWorks } from "@/components/marketing/cinematic/HowConddoWorks";
import { PlatformDiagram } from "@/components/marketing/cinematic/PlatformDiagram";
import { ModuleDeepSection } from "@/components/marketing/cinematic/ModuleDeepSection";
import { WhyChooseConddo } from "@/components/marketing/cinematic/WhyChooseConddo";
import {
  FlexibilitySection,
  PRODUCT_INDUSTRIES,
} from "@/components/marketing/cinematic/FlexibilitySection";
import { CinematicFinalCTA } from "@/components/marketing/cinematic/CinematicFinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import {
  WebsiteVisual,
  CustomersVisual,
  OrdersVisual,
  InventoryVisual,
  PaymentsVisual,
  MarketingVisual,
  AnalyticsVisual,
  StaffVisual,
} from "@/components/marketing/cinematic/AnimatedBento";

export const metadata: Metadata = {
  title: "Product — Conddo.io",
  description:
    "One platform. Every operation. Customers, orders, payments, inventory, marketing, team, and analytics in one connected system.",
};

/** Product deep-dive page. UX structure:
 *
 *    Hero (PRODUCT OVERVIEW)
 *    HowConddoWorks
 *    PlatformDiagram
 *    Module deep sections × 8 (alternating left/right)
 *      Website & Commerce | Customers | Orders & Bookings | Inventory
 *      Payments | Marketing | Analytics | Team Management
 *    WhyChooseConddo
 *    FlexibilitySection (5 industries — Hospitality included)
 *    CinematicFinalCTA
 *
 *  Module visuals are imported from AnimatedBento so the home + product
 *  pages share the same live animations — saves bytes and keeps the
 *  visual language consistent between the bento teaser and the deep
 *  section. */
export default function ProductPage() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="Product overview"
        titleTop="One platform."
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            Every operation.
          </span>
        }
        lede={
          <>
            <p>
              Conddo brings your customers, orders, payments, inventory, marketing, team, and business operations together in one connected system.
            </p>
            <p className="text-white/45">
              Instead of managing your business across multiple tools, spreadsheets, and workflows, Conddo gives you one place to run everything.
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/onboarding/create-account" variant="primary" size="lg">
            Start free trial
            <ArrowRight size={18} />
          </Button>
          <Button href="/pricing" variant="secondary-dark" size="lg">
            See pricing
          </Button>
        </div>
      </HeroGeometric>

      <HowConddoWorks />

      {/* Marker section for /product#platform footer-link anchor. */}
      <div id="platform" />
      <PlatformDiagram />

      {/* Eight module deep sections, alternating left/right. Anchors match
          the home bento's deep-link hrefs and the footer Features link. */}
      <ModuleDeepSection
        anchor="website"
        eyebrow="Website & Commerce"
        title={<>Build a presence that <span className="text-primary-light">sells</span>.</>}
        description="Build a professional online presence that helps customers discover, engage with, and buy from your business."
        outcomes={[
          "Launch quickly.",
          "Accept payments.",
          "Capture leads.",
          "Manage bookings.",
          "Sell products and services.",
        ]}
        visual={<WebsiteVisual />}
      />
      <ModuleDeepSection
        anchor="customers"
        eyebrow="Customers"
        title="Know every customer."
        description="Build stronger relationships with a complete view of customer activity, purchases, interactions, and history."
        outcomes={[
          "Understand customer behaviour.",
          "Segment audiences.",
          "Track lifetime value.",
          "Deliver better service.",
        ]}
        visual={<CustomersVisual />}
        reverse
      />
      <ModuleDeepSection
        anchor="orders"
        eyebrow="Orders & Bookings"
        title="One workflow for every transaction."
        description="Whether customers place orders online, book appointments, request services, or visit in person, Conddo keeps everything organized and visible."
        outcomes={[
          "Track progress.",
          "Manage fulfilment.",
          "Coordinate teams.",
          "Reduce delays.",
        ]}
        visual={<OrdersVisual />}
      />
      <ModuleDeepSection
        anchor="inventory"
        eyebrow="Inventory"
        title="Stay ahead of stock movement."
        description="Monitor inventory levels, product performance, stock transfers, and replenishment from one place."
        outcomes={[
          "Reduce stockouts.",
          "Improve visibility.",
          "Track movement.",
          "Stay organized.",
        ]}
        visual={<InventoryVisual />}
        reverse
      />
      <ModuleDeepSection
        anchor="payments"
        eyebrow="Payments"
        title="Get paid with confidence."
        description="Accept, track, and reconcile payments through a unified system designed for modern businesses."
        outcomes={[
          "Manage invoices.",
          "Track transactions.",
          "Monitor cash flow.",
          "Maintain accurate records.",
        ]}
        visual={<PaymentsVisual />}
      />
      <ModuleDeepSection
        anchor="marketing"
        eyebrow="Marketing"
        title="Turn customers into repeat customers."
        description="Create campaigns, reward loyalty, automate engagement, and build long-term customer relationships."
        outcomes={[
          "Drive retention.",
          "Increase repeat purchases.",
          "Strengthen engagement.",
          "Measure performance.",
        ]}
        visual={<MarketingVisual />}
        reverse
      />
      <ModuleDeepSection
        anchor="analytics"
        eyebrow="Analytics"
        title="Make decisions backed by data."
        description="Track business performance through real-time insights into revenue, customer activity, operational efficiency, and growth."
        outcomes={[
          "Understand trends.",
          "Identify opportunities.",
          "Measure outcomes.",
          "Act with confidence.",
        ]}
        visual={<AnalyticsVisual />}
      />
      <ModuleDeepSection
        anchor="team"
        eyebrow="Team Management"
        title="Bring your team into one workspace."
        description="Give every employee the access and tools they need while maintaining visibility, accountability, and control."
        outcomes={[
          "Role-based access.",
          "Centralized collaboration.",
          "Improved accountability.",
          "Secure operations.",
        ]}
        visual={<StaffVisual />}
        reverse
      />

      <WhyChooseConddo />

      <FlexibilitySection
        industries={PRODUCT_INDUSTRIES}
        outroLine="The same platform. The right experience for your business."
      />

      <CinematicFinalCTA />
    </MarketingShell>
  );
}
