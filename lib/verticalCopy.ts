// Placeholder / sample copy that adapts to the tenant's vertical, so a
// pharmacy owner never sees "Ankara fabric" in their inventory placeholder
// and a tailor never sees "Paracetamol 500mg".
//
// Each helper takes a vertical id and returns a plain string ready to drop
// into a placeholder, hint, or empty-state caption. Unknown verticals fall
// through to a neutral default.

import type { Me } from "@/lib/api/account";

export type VerticalId =
  | "pharmacy"
  | "fashion"
  | "retail"
  | "logistics"
  | "professional-services"
  | "food-and-beverage"
  | "beauty-and-wellness"
  | "music-studio"
  | "general";

/** Convenience — pull the vertical id off a Me payload, normalised. */
export const verticalOf = (me?: Me | null): VerticalId | undefined => {
  const v = me?.tenant?.verticalId?.trim().toLowerCase();
  return v ? (v as VerticalId) : undefined;
};

/** Inventory "product" name placeholder. Pharmacy ≠ fashion ≠ logistics. */
export function productNamePlaceholder(v?: VerticalId): string {
  switch (v) {
    case "pharmacy":              return "e.g. Paracetamol 500mg";
    case "fashion":               return "e.g. Ankara fabric (2yds)";
    case "retail":                return "e.g. Levi's 501 jeans";
    case "food-and-beverage":     return "e.g. Jollof rice (large)";
    case "beauty-and-wellness":   return "e.g. Hair conditioner 250ml";
    case "music-studio":          return "e.g. Studio session (per hour)";
    case "logistics":             return "e.g. Lagos → Abuja parcel (10kg)";
    case "professional-services": return "e.g. 1-hour consultation";
    default:                      return "Your product or service";
  }
}

/** Customer business / contact name placeholder. */
export function customerNamePlaceholder(v?: VerticalId): string {
  switch (v) {
    case "pharmacy":              return "e.g. Chinedu Okafor";
    case "fashion":               return "e.g. Adaeze Williams";
    case "logistics":             return "e.g. Lagos Distribution Co.";
    case "professional-services": return "e.g. Tunde Bello";
    default:                      return "e.g. Customer name";
  }
}

/** Business / brand name placeholder used on the signup business-profile step. */
export function businessNamePlaceholder(v?: VerticalId): string {
  switch (v) {
    case "pharmacy":              return "e.g. Wellspring Pharmacy";
    case "fashion":               return "e.g. Heritage Tailors";
    case "retail":                return "e.g. Lagos Style Co.";
    case "food-and-beverage":     return "e.g. Mama's Kitchen";
    case "beauty-and-wellness":   return "e.g. Bloom Spa";
    case "music-studio":          return "e.g. Sound Anchor Studios";
    case "logistics":             return "e.g. Swift Delivery NG";
    case "professional-services": return "e.g. Lex & Co Consulting";
    default:                      return "Your business name";
  }
}

/** Suggested inventory categories — shown as quick-add chips on the empty
 *  state of the Manage Categories page. Tenants click any chip to add that
 *  category in one tap; the list is curated for the vertical so a pharmacy
 *  doesn't see "Wedding Dresses" and a tailor doesn't see "Antibiotics". */
export function inventoryCategorySuggestions(v?: VerticalId): string[] {
  switch (v) {
    case "pharmacy":
      return [
        "Analgesics",
        "Anti-Malaria",
        "Antibiotics",
        "Antihypertensives",
        "Vitamins & Supplements",
        "Personal Care",
        "First Aid",
        "Baby Care",
        "Antidiabetics",
        "Oncology",
        "Respiratory",
      ];
    case "fashion":
      return ["Fabrics", "Garments", "Accessories", "Wedding", "Casual wear", "Formal wear", "Footwear"];
    case "retail":
      return ["Clothing", "Electronics", "Home", "Beauty", "Food & beverage", "Other"];
    case "food-and-beverage":
      return ["Mains", "Sides", "Drinks", "Desserts", "Snacks", "Specials"];
    case "beauty-and-wellness":
      return ["Hair care", "Skin care", "Nail care", "Massage", "Treatments", "Retail products"];
    case "music-studio":
      return ["Studio rooms", "Vocal booths", "Lesson rooms", "Equipment hire", "Mixing services"];
    case "logistics":
      return ["Domestic delivery", "Same-day", "Next-day", "Heavy goods", "International"];
    case "professional-services":
      return ["Consultations", "Retainer", "Project work", "Workshops", "Audits"];
    default:
      return ["General", "Featured", "Best sellers", "New arrivals", "On sale"];
  }
}

/** Sample website-change request body so the textarea hint matches the vertical. */
export function websiteChangeExample(v?: VerticalId): string {
  switch (v) {
    case "pharmacy":
      return "e.g. Add a 'Telepharmacy consultation' section to the homepage with a booking button.";
    case "fashion":
      return "e.g. Replace the homepage hero image with the new brand shot, and update the headline to 'Tailored to fit.'";
    case "retail":
      return "e.g. Add a 'New arrivals' grid at the top of the shop page.";
    case "food-and-beverage":
      return "e.g. Add today's specials to the menu page and update opening hours.";
    case "beauty-and-wellness":
      return "e.g. Add a 'Book a treatment' CTA to the services page.";
    case "music-studio":
      return "e.g. Add a gallery of past sessions to the home page.";
    case "logistics":
      return "e.g. Add a quote calculator block to the home page.";
    case "professional-services":
      return "e.g. Add the team bios with photos to the About page.";
    default:
      return "Describe the edits you'd like — copy, images, layout, anything.";
  }
}
