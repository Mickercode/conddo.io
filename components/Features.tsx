import type { ComponentType } from "react";
import {
  Globe,
  ClipboardList,
  Wallet,
  Megaphone,
  BarChart3,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { WebsiteMock } from "./mocks/WebsiteMock";
import { OperationsMock } from "./mocks/OperationsMock";
import { PaymentsMock } from "./mocks/PaymentsMock";
import { MarketingMock } from "./mocks/MarketingMock";
import { AnalyticsMock } from "./mocks/AnalyticsMock";

type Feature = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  body: string;
  Mock: ComponentType;
};

const features: Feature[] = [
  {
    eyebrow: "Website",
    icon: Globe,
    title: "A professional business website.",
    body: "Goes live with payments built in. Bookings, products, or services — whichever way you sell, share one link and start.",
    Mock: WebsiteMock,
  },
  {
    eyebrow: "Operations",
    icon: ClipboardList,
    title: "Orders, inventory, and customers — clean.",
    body: "Every order tracked from placement to delivery. Live stock counts. Every customer's history in one place. No more lost notes.",
    Mock: OperationsMock,
  },
  {
    eyebrow: "Payments",
    icon: Wallet,
    title: "Get paid faster. Track every naira.",
    body: "Online and in-person. Automatic invoices and receipts. See what's paid, what's outstanding, what's overdue — no spreadsheet.",
    Mock: PaymentsMock,
  },
  {
    eyebrow: "Marketing",
    icon: Megaphone,
    title: "More customers, fewer apps.",
    body: "Schedule social posts, run Facebook + Instagram ads, send SMS and email — all inside Conddo.io. Top up ad budget in Naira. No dollar card.",
    Mock: MarketingMock,
  },
  {
    eyebrow: "Analytics",
    icon: BarChart3,
    title: "See how the business is actually doing.",
    body: "Revenue, best-sellers, customer activity, ad performance — one dashboard. Decisions on numbers, not guesswork.",
    Mock: AnalyticsMock,
  },
];

export function Features() {
  return (
    <Section tone="bg" id="features">
      {/* Section lead-in */}
      <div className="mb-16 max-w-2xl md:mb-20">
        <Eyebrow>Features</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          One platform. Every part of your business.
        </h2>
      </div>

      <div className="space-y-24 md:space-y-32">
        {features.map(({ eyebrow, icon: Icon, title, body, Mock }, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={eyebrow}
              // Mock column is wider than the copy column (3:5 on desktop) so
              // the product does most of the explaining. Copy now sits in a
              // tight column — title + one short paragraph + a CTA — and the
              // mock fills the remaining space at near-full reading width.
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-14"
            >
              {/* Copy column */}
              <div className={reverse ? "lg:order-2" : ""}>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-bg">
                  <Icon size={20} className="text-primary" strokeWidth={2} />
                </div>
                <Eyebrow>{eyebrow}</Eyebrow>
                <h3 className="max-w-md text-[28px] leading-snug tracking-[-0.01em] md:text-[34px]">
                  {title}
                </h3>
                <p className="mt-4 max-w-md text-[16px] leading-[1.65] text-content-secondary">
                  {body}
                </p>
                <a
                  href="#pricing"
                  className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  Learn more
                  <ArrowRight size={16} />
                </a>
              </div>

              {/* Mock column — let it use the full lg width without padding so
                  the product UI reads at a usable scale. */}
              <div className={reverse ? "lg:order-1" : ""}>
                <Mock />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
