import type { Metadata } from "next";
import {
  Music2, Mic2, Calendar, Wallet, Users, Headphones, Disc3, Clock,
} from "lucide-react";
import { VerticalLanding, type VerticalSpec } from "@/components/marketing/VerticalLanding";

export const metadata: Metadata = {
  title: "Conddo for Music Studios",
  description:
    "Session bookings, deposits via Routepay, room schedules, artist profiles. The studio workspace for Nigerian recording + rehearsal businesses.",
};

const spec: VerticalSpec = {
  slug: "music-studio",
  eyebrow: "Conddo for Music Studios",
  headline: "Run the studio like a studio. Not a chat thread.",
  lede: "Session bookings, deposits collected before the artist shows up, room schedules that don't double-book, and an artist profile that follows the project. Stop running your studio in WhatsApp Status.",
  signupHref: "/onboarding/create-account?vertical=music-studio",
  modules: [
    {
      icon: Calendar,
      eyebrow: "Sessions",
      title: "Bookable rooms, no clashes.",
      description: "Self-serve booking for each room. The calendar prevents double-booking before it happens. Engineer assignment per session.",
    },
    {
      icon: Wallet,
      eyebrow: "Deposits",
      title: "Collect deposits before the session.",
      description: "Routepay-powered deposit on every booking. No deposit, no booking. Stops no-shows dead.",
    },
    {
      icon: Mic2,
      eyebrow: "Artists",
      title: "Artist profiles that travel with the project.",
      description: "Stage name, contact, BPM preferences, mix notes from the last session. Engineer opens the profile, knows what they're walking into.",
    },
    {
      icon: Clock,
      eyebrow: "Time tracking",
      title: "Bill the hours you actually worked.",
      description: "Track time per session, per room, per engineer. Bill the difference if an artist overruns. Or absorb it. Either way, you have the data.",
    },
    {
      icon: Disc3,
      eyebrow: "Project files",
      title: "Project history in one place.",
      description: "Sessions linked to a project. Mix notes, file hand-off references, revision tracking. When the artist comes back six months later to remix, you find everything.",
    },
    {
      icon: Headphones,
      eyebrow: "Rooms & gear",
      title: "Know what's free, what's broken, what's booked.",
      description: "Each room and key gear (vocal booth, plug-in license, hardware) tracked. Out-of-service flags so you don't book a session on a dead monitor.",
    },
    {
      icon: Users,
      eyebrow: "Repeat clients",
      title: "Your top 20% pays the bills. Keep them.",
      description: "Cashback loyalty, configurable per studio. Producers who come back monthly get the rate that makes them want to come back monthly.",
    },
    {
      icon: Music2,
      eyebrow: "Storefront",
      title: "A website that books, not just sits.",
      description: "Public booking page on your subdomain. Rates, room photos, sample work, real availability. Artists DM less, book more.",
    },
  ],
  scenario: {
    title: "A Saturday at Soundroom Lagos",
    paragraphs: [
      "Tunde, the studio owner, opens his phone over breakfast. Four bookings overnight — three with deposits already through Routepay, one pending. He doesn't have to do anything; the deposit-required setting kicked the fourth into 'awaiting payment' automatically.",
      "By 11am the first session starts. The engineer opens the artist profile, sees last session's mix notes, sees the BPM, sees that the artist prefers Pro Tools. No 'sorry, what plug-in did we use again?' five minutes in.",
      "Around 2pm an artist messages asking if Studio B is free Sunday afternoon. Tunde checks the calendar — booked, but he sees Studio A has the same gear and a slot opens at 3pm. He sends the link, artist books in two minutes.",
      "End of day, Tunde opens analytics. Three sessions billed, ₦340k collected, the Diamond-tier producer who's been with the studio for 18 months just hit ₦12k in cashback. Tunde sends him a 'thanks for the loyalty' DM.",
      "He closes the laptop. The studio ran itself today.",
    ],
  },
  stats: [
    { label: "No-show rate drop", value: "−71%" },
    { label: "Bookings via website", value: "63%" },
    { label: "Avg. session value", value: "₦115k" },
    { label: "Setup time", value: "8 min" },
  ],
};

export default function MusicStudioVerticalPage() {
  return <VerticalLanding spec={spec} />;
}
