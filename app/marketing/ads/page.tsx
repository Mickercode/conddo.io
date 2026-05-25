import { AppShell } from "@/components/app/AppShell";
import { MarketingTabs } from "@/components/app/MarketingTabs";
import { ComingSoon } from "@/components/app/ComingSoon";

// Ad management is a Pro-tier feature; its backend (campaigns + spend tracking
// via the ad networks) isn't live yet, so this stays a placeholder until then.
export default function AdsPage() {
  return (
    <AppShell title="Marketing">
      <MarketingTabs active="Ads" />
      <ComingSoon title="Ad management" />
    </AppShell>
  );
}
