import {
  Home,
  Globe,
  Users,
  ShoppingCart,
  CalendarDays,
  Package,
  Wallet,
  Megaphone,
  BarChart3,
  IdCard,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

// The canonical app sidebar — shared by every authenticated screen.
export const APP_NAV: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Website", href: "/website", icon: Globe },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Staff", href: "/staff", icon: IdCard },
  { label: "Settings", href: "/settings", icon: Settings },
];
