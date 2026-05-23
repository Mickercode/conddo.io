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
    title: "Get a professional business website.",
    body: "Your business goes live with a website built for how you sell — whether you take bookings, sell products, or offer services. Accept payments directly. Share your link. Start selling.",
    Mock: WebsiteMock,
  },
  {
    eyebrow: "Operations",
    icon: ClipboardList,
    title: "Manage your orders, inventory, and customers — cleanly.",
    body: "Track every order from placement to delivery. Know your stock levels in real time. Keep every customer's details, purchase history, and preferences in one place. No more lost information.",
    Mock: OperationsMock,
  },
  {
    eyebrow: "Payments",
    icon: Wallet,
    title: "Get paid faster. Track every naira.",
    body: "Accept payments online and in-person. Generate invoices and receipts automatically. See exactly what has come in, what is outstanding, and what is overdue — without touching a spreadsheet.",
    Mock: PaymentsMock,
  },
  {
    eyebrow: "Marketing",
    icon: Megaphone,
    title: "Reach more customers without switching apps.",
    body: "Schedule your social media posts, run Facebook and Instagram ads, send SMS and email campaigns — all from inside Conddo.io. Top up your ad budget in Naira. No dollar card needed.",
    Mock: MarketingMock,
  },
  {
    eyebrow: "Analytics",
    icon: BarChart3,
    title: "See how your business is actually performing.",
    body: "Revenue, best-selling products, customer activity, ad performance — all in one dashboard. Make decisions based on numbers, not guesswork.",
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

      <div className="space-y-20 md:space-y-28">
        {features.map(({ eyebrow, icon: Icon, title, body, Mock }, i) => {
          const reverse = i % 2 === 1;
          return (
            <div
              key={eyebrow}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/* Copy column */}
              <div className={reverse ? "lg:order-2" : ""}>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-bg">
                  <Icon size={20} className="text-primary" strokeWidth={2} />
                </div>
                <Eyebrow>{eyebrow}</Eyebrow>
                <h3 className="max-w-md text-[26px] leading-snug tracking-[-0.01em] md:text-[30px]">
                  {title}
                </h3>
                <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-content-secondary">
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

              {/* Mock column */}
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
