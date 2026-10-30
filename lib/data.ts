export type Kind = "rent" | "house" | "land" | "offplan" | "build" | "invest";
export type Listing = { slug: string; title: string; kind: Kind; zone: string; price: number; when: 0 | 1 | 2; note: string; img: string; gallery?: string[]; featured?: boolean };
export const KIND_LABEL: Record<Kind, string> = { rent: "Rent", house: "Buy house", land: "Buy land", offplan: "Off-plan", build: "Build-to-own", invest: "Invest" };
export const WHEN = ["Now", "Soon", "Later"] as const;
export const ZONES = ["Accra", "Kumasi", "Tamale"] as const;
/* ---------- Contact ---------- */
export const WA = "233541988383"; // WhatsApp number, international format, no + or spaces
export const PHONE = "+233 54 198 8383";
export const PHONE_HREF = "tel:+233541988383";
/** Business Gmail address. Set NEXT_PUBLIC_EMAIL in .env.local (the fallback below is a harmless placeholder). */
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL ?? "bbhomes@example.com";
/** Opens a Gmail compose window addressed to B B Homes, with an optional subject and message. */
export const gmailLink = (subject = "Enquiry from the B B Homes website", body = "") =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL)}&su=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
/** Opens WhatsApp with a prefilled message to the B B Homes team. */
export const whatsappLink = (message: string) => `https://wa.me/${WA}?text=${encodeURIComponent(message)}`;
export const MAP_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3936.125967505394!2d-0.8641031249764275!3d9.410344690666989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfd43cf898d9efe9%3A0x109fa8c1ba3e431d!2sAliu%20Mahama%20Sports%20Stadium!5e0!3m2!1sen!2sgh!4v1793078321087!5m2!1sen!2sgh";
export const MAP_LINK = "https://www.google.com/maps/search/?api=1&query=Aliu+Mahama+Sports+Stadium+Tamale";

/* ---------- Team ----------
   Add a real `name` and a Cloudinary `photo` (public id from the bb folder) to each person once you have them.
   Until then the card shows the role with an icon, so no invented names or stock faces appear on the site. */
export type Member = { role: string; blurb: string; name?: string; photo?: string };
/** Chairman portrait, hosted on a separate Cloudinary account. Pre-sized and auto-formatted at the source. */
export const CHAIRMAN_PHOTO = "https://res.cloudinary.com/ea91sdts/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_800,h_1000/v1793375861/Screenshot_7.png";
export const TEAM: Member[] = [
  { role: "Chairman", blurb: "Leads B B Homes and stands behind the promise that a home is a human right.", photo: CHAIRMAN_PHOTO },
  { role: "Sales and lettings", blurb: "Your named point of contact. Shortlists homes, plots and rentals and walks you through every step.", photo: "worker" },
  { role: "Construction and materials", blurb: "Plans phased builds and prepares clear materials quotes from our own depot.", photo: "worker2" },
  { role: "Home care", blurb: "Property management, maintenance and renovation after you move in.", photo: "worker3" },
];

/* ---------- Cloudinary images (folder "bb") ---------- */
export const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD ?? "jrqocjcd";
export const IMG = {
  hero: "beautiful-modern-house-cement-view-from-garden",
  home2: "beautiful-modern-house-cement-view-from-garden_1",
  model1: "3d-rendering-house-model_1_1",
  model2: "3d-rendering-house-model_2",
  land1: "land1_1_1",
  land2: "land1_2",
  build1: "modern-country-houses-construction_1_1",
  build2: "modern-country-houses-construction_2",
  village: "village-view-from_1",
} as const;
/** Cloudinary delivery URL: auto format and quality, smart crop, resized on their CDN. */
export const cld = (id: string, w: number, h?: number) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,c_fill,g_auto,w_${w}${h ? `,h_${h}` : ""}/${id}`;

/** Round B B Homes badge (transparent cutout) used as the chat button. Cloudinary resizes it and serves WebP/AVIF automatically. */
export const AI_BADGE_ID = "v1793083431/BB_Homes_Corporate_Portrait_Badge_cutout.png";
export const aiBadgeUrl = (size: number) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,c_fit,w_${size},h_${size}/${AI_BADGE_ID}`;

/** Logo from Cloudinary. e_trim removes empty margins; request 2x the display height for sharp retina screens. */
export const LOGO_ID = "Elegant_BB_Homes_Real_Estate_Logo";
export const logoUrl = (displayHeight: number) => `https://res.cloudinary.com/${CLOUD}/image/upload/e_trim/f_auto,q_auto,h_${displayHeight * 2}/${LOGO_ID}`;
/** Square version for browser tab icons. */
export const logoIconUrl = (size: number) => `https://res.cloudinary.com/${CLOUD}/image/upload/e_trim/c_pad,w_${size},h_${size},b_white/f_png/${LOGO_ID}`;

// SAMPLE DATA. Replace with the client's real listings (CMS or database).
export const listings: Listing[] = [
  { slug: "compact-one-bed-unit", title: "Compact 1-bed unit", kind: "rent", zone: "Accra", price: 1800, when: 0, note: "Managed property", img: IMG.model2, gallery: [IMG.model1, IMG.home2] },
  { slug: "furnished-two-bed-stay", title: "Furnished 2-bed, medium stay", kind: "rent", zone: "Kumasi", price: 2600, when: 0, note: "Short and medium stays", img: IMG.model1, gallery: [IMG.model2, IMG.hero] },
  { slug: "existing-three-bed-home", title: "Existing 3-bed home", kind: "house", zone: "Kumasi", price: 420000, when: 0, note: "Move in now", img: IMG.home2, gallery: [IMG.hero, IMG.model1], featured: true },
  { slug: "affordable-plot-450", title: "Affordable plot, 450 m²", kind: "land", zone: "Tamale", price: 35000, when: 1, note: "Pay in stages", img: IMG.land2, gallery: [IMG.land1, IMG.village] },
  { slug: "plot-600", title: "Plot, 600 m²", kind: "land", zone: "Accra", price: 160000, when: 1, note: "Title documents shown upfront", img: IMG.land1, gallery: [IMG.land2, IMG.village] },
  { slug: "land-and-house-package", title: "Land and house package", kind: "house", zone: "Kumasi", price: 310000, when: 1, note: "One price, one team", img: IMG.hero, gallery: [IMG.land1, IMG.model1], featured: true },
  { slug: "off-plan-two-bed-apartment", title: "Off-plan 2-bed apartment", kind: "offplan", zone: "Accra", price: 280000, when: 1, note: "Pay as it is built", img: IMG.build1, gallery: [IMG.build2, IMG.model2], featured: true },
  { slug: "build-to-own-two-bed", title: "Build-to-own, 2-bed standard design", kind: "build", zone: "Tamale", price: 130000, when: 1, note: "Phased construction", img: IMG.build2, gallery: [IMG.model1, IMG.land2] },
  { slug: "land-bank-growth-corridor", title: "Land bank, growth corridor", kind: "land", zone: "Kumasi", price: 90000, when: 2, note: "Land investment", img: IMG.village, gallery: [IMG.land1, IMG.land2], featured: true },
  { slug: "small-family-compound", title: "Small family compound", kind: "invest", zone: "Tamale", price: 240000, when: 2, note: "Portfolio building", img: IMG.model2, gallery: [IMG.village, IMG.build2] },
  { slug: "rental-starter-three-units", title: "Rental starter, 3 units", kind: "invest", zone: "Accra", price: 520000, when: 2, note: "Development opportunity", img: IMG.model1, gallery: [IMG.build1, IMG.hero], featured: true },
];
/** Listings marked `featured: true` rotate through the featured panel, newest data change included. */
export const featuredListings = (all: Listing[]) => all.filter((l) => l.featured);
export const commit = (l: Listing) => (l.kind === "rent" ? l.price * 12 : l.price);
export const money = (n: number) => "GHS " + Math.round(n).toLocaleString("en-US");
export const materials: [string, number][] = [["Cement, 50 kg bag", 95], ["Steel rod, 12 mm", 150], ["Roofing sheet", 120], ["PVC pipe, 4 in", 65], ["Electrical cable roll", 480], ["Door, flush panel", 650], ["Paint, 20 L", 520], ["Floor tiles, per m²", 70], ["Sanitary ware set", 900], ["Tool kit", 350]];
export const NEXT: Record<Kind, string> = { rent: "Rent-to-own: see how your rent counts toward buying.", land: "Pick a standard design and get a materials quote.", build: "Request a materials quote for your build phase.", offplan: "Compare with a land and house package.", house: "Add a management and maintenance plan.", invest: "Explore a second plot and rental management." };

/* ---------- Trust content (commitments, not invented statistics) ---------- */
export const PROMISES: [string, string][] = [
  ["Documents upfront", "Title and site documents are shown before you pay or commit to anything."],
  ["One named agent", "Every enquiry gets a reference number and a named person who replies."],
  ["Clear, staged pricing", "Prices are shown in cedis. Selected plots and builds can be paid in stages."],
  ["Visit before you decide", "Book a site visit. We walk you through the land, the build and the paperwork."],
];
export const STEPS: [string, string][] = [
  ["Tell us what you need", "Place, budget and timing. Use the finder or send a one-tap enquiry."],
  ["Meet your agent", "A named agent replies on WhatsApp, phone or email and shortlists real options."],
  ["Visit and verify", "See the site, check the documents, ask every question before committing."],
  ["Agree a clear plan", "A written payment plan and timeline. Staged payments where available."],
  ["Move in and be looked after", "Handover, then management, maintenance and renovation if you want it."],
];
export const FAQ: [string, string][] = [
  ["Can I pay in stages?", "On selected plots and build-to-own homes, yes. An agent confirms the exact plan and timeline in writing before you commit. The calculators on this site are illustrative only."],
  ["How do I know the land is genuine?", "We show title documents upfront and encourage you to verify them, including with your own lawyer or at the Lands Commission, before any payment."],
  ["Do you only sell, or also build?", "Both. You can buy land, buy a finished house, or build on land you already own. Materials come from our own depot, so quotes stay clear."],
  ["What happens after I move in?", "Our home services team handles property management, maintenance, repairs and renovation, with a tracked reference for every request."],
  ["How fast will someone reply?", "Enquiries get a reference immediately and a named agent follows up on the channel you choose."],
];
