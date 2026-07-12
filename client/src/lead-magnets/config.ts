import {
  Bot,
  Building2,
  FileCheck2,
  MapPinned,
  RefreshCcw,
  type LucideIcon,
} from "lucide-react";

export type LeadMagnetId =
  | "local-growth-map"
  | "ai-receptionist"
  | "competitor-exit"
  | "state-compliance"
  | "bid-radar";

export interface LeadMagnetConfig {
  id: LeadMagnetId;
  shortName: string;
  experimentLabel: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  body: string;
  primaryCta: string;
  resultTitle: string;
  resultBody: string;
  accent: string;
  accentSoft: string;
  icon: LucideIcon;
  proof: Array<{ value: string; label: string }>;
  benefits: Array<{ title: string; body: string }>;
  qualifier: string;
  integrationNote: string;
}

export const LEAD_MAGNETS: LeadMagnetConfig[] = [
  {
    id: "local-growth-map",
    shortName: "Local Growth Map",
    experimentLabel: "Variant A",
    eyebrow: "Free local market map for pest control owners",
    headline: "Find the nearby markets",
    highlight: "your competitors are leaving open.",
    body: "Use your company and service area to preview the review gaps, nearby markets, and local-growth opportunities a PestFlow report would surface.",
    primaryCta: "Build my growth map",
    resultTitle: "Your Local Growth Map request is saved",
    resultBody: "The staging result shows the report hierarchy and handoff. Live Google and Maps enrichment is intentionally not enabled yet.",
    accent: "#17805c",
    accentSoft: "#e8f7f1",
    icon: MapPinned,
    proof: [
      { value: "1", label: "business to look up" },
      { value: "3", label: "nearby market opportunities" },
      { value: "0", label: "long audit questions" },
    ],
    benefits: [
      { title: "Local visibility gaps", body: "Show where the company appears strong, weak, or absent relative to nearby operators." },
      { title: "Review opportunity", body: "Frame the review gap against local competitors instead of an abstract score." },
      { title: "Route-growth direction", body: "Turn local-market information into a practical next area to investigate." },
    ],
    qualifier: "An operating company normally has a business name, website, service area, and local competitors.",
    integrationNote: "Lead capture is live. Google Business Profile, Places, review, and search enrichment remain staged.",
  },
  {
    id: "ai-receptionist",
    shortName: "AI Call Challenge",
    experimentLabel: "Variant B",
    eyebrow: "Hear a pest-control lead handled in seconds",
    headline: "Put PestFlow's receptionist",
    highlight: "through a real call challenge.",
    body: "Choose the call you want to test, enter the number where you want the demonstration, and preview the transcript and owner handoff.",
    primaryCta: "Set up my demo call",
    resultTitle: "Your AI Call Challenge request is saved",
    resultBody: "The staging experience previews the transcript and captured lead. It does not place an outbound call yet.",
    accent: "#6c4ee3",
    accentSoft: "#f0edff",
    icon: Bot,
    proof: [
      { value: "30 sec", label: "target time to first proof" },
      { value: "1 call", label: "instead of a generic demo" },
      { value: "Live", label: "transcript handoff concept" },
    ],
    benefits: [
      { title: "Pest-specific intake", body: "Test termites, rodents, bed bugs, or a recurring-service question rather than generic receptionist copy." },
      { title: "Owner notification", body: "Preview the lead summary, urgency, contact information, and requested appointment." },
      { title: "Product proof", body: "Make the AI receptionist demonstrate the promise instead of describing it." },
    ],
    qualifier: "The phone number is part of the requested experience, so contact capture feels functional instead of arbitrary.",
    integrationNote: "Lead capture and transcript preview are live. Outbound calling remains staged until a real end-to-end call is verified.",
  },
  {
    id: "competitor-exit",
    shortName: "Competitor Exit Center",
    experimentLabel: "Variant C",
    eyebrow: "A safer switch plan for established operators",
    headline: "See how to leave your current system",
    highlight: "without risking next week's routes.",
    body: "Choose what you use today and get a tailored export request, validation checklist, pilot plan, and path to a one-route PestFlow test.",
    primaryCta: "Build my exit plan",
    resultTitle: "Your software exit plan is ready to preview",
    resultBody: "The staged checklist changes with the source system and keeps sensitive payment data on official migration paths.",
    accent: "#255f9f",
    accentSoft: "#eaf2fc",
    icon: RefreshCcw,
    proof: [
      { value: "1 route", label: "representative pilot" },
      { value: "4", label: "validation checkpoints" },
      { value: "Your call", label: "when to cut over" },
    ],
    benefits: [
      { title: "Source-specific request", body: "Give the owner an export request matched to FieldRoutes, PestPac, GorillaDesk, Briostack, or spreadsheets." },
      { title: "Validation before cutover", body: "Reconcile customers, service addresses, recurring work, balances, and documents before the old system changes." },
      { title: "Representative pilot", body: "Offer one route as product proof before discussing a complete migration." },
    ],
    qualifier: "Current software, route count, and switching timing reveal both business activity and purchase intent.",
    integrationNote: "Lead capture and tailored checklists are live. Full imports remain a permissioned concierge workflow, not an automatic staging action.",
  },
  {
    id: "state-compliance",
    shortName: "State Compliance Pack",
    experimentLabel: "Variant D",
    eyebrow: "State-specific recordkeeping starter pack",
    headline: "Put your pest-control records",
    highlight: "into one inspection-ready checklist.",
    body: "Choose your state and service mix to preview the application record, customer copy, technician, product, and retention sections in your pack.",
    primaryCta: "Build my state pack",
    resultTitle: "Your State Compliance Pack request is saved",
    resultBody: "The staging pack demonstrates the structure only. Production packs must be sourced and reviewed against current official agency guidance.",
    accent: "#9b5c16",
    accentSoft: "#fff4e4",
    icon: FileCheck2,
    proof: [
      { value: "1 state", label: "matched to the operator" },
      { value: "5", label: "recordkeeping sections" },
      { value: "Official", label: "source links planned" },
    ],
    benefits: [
      { title: "Application record", body: "Organize service date, location, applicator, product, EPA registration, quantity, and method fields." },
      { title: "Customer and technician proof", body: "Keep customer copies, technician credentials, corrections, and delivery history together." },
      { title: "Official-source routing", body: "Give every production pack a visible source and last-reviewed date." },
    ],
    qualifier: "State, service mix, and technician count are naturally useful only to licensed or operating pest-control businesses.",
    integrationNote: "Lead capture and pack preview are live. State requirements are not represented as legally complete in staging.",
  },
  {
    id: "bid-radar",
    shortName: "Pest Control Bid Radar",
    experimentLabel: "Variant E",
    eyebrow: "Commercial and government opportunities by service area",
    headline: "Stop hunting across portals",
    highlight: "for the next pest-control contract.",
    body: "Choose the markets and account types you serve to preview a filtered weekly radar for municipal, school, multifamily, food, and commercial opportunities.",
    primaryCta: "Build my bid radar",
    resultTitle: "Your Pest Control Bid Radar request is saved",
    resultBody: "The staging feed uses clearly labeled sample opportunities. Live procurement feeds and deadline monitoring are not enabled yet.",
    accent: "#b13b55",
    accentSoft: "#fcecf0",
    icon: Building2,
    proof: [
      { value: "Weekly", label: "recurring reason to return" },
      { value: "Local", label: "state and county filtering" },
      { value: "Qualified", label: "commercial operator signals" },
    ],
    benefits: [
      { title: "Opportunity filtering", body: "Filter by geography, property type, deadline, experience, and service capability." },
      { title: "Deadline reminders", body: "Turn a one-time lead magnet into a recurring, useful PestFlow relationship." },
      { title: "Bid-to-pipeline bridge", body: "Connect selected opportunities to proposal, follow-up, and sales-pipeline workflows." },
    ],
    qualifier: "Service area, commercial experience, and technician count surface established companies without a long qualification form.",
    integrationNote: "Lead capture and sample feed are live. Procurement ingestion and freshness monitoring remain staged.",
  },
];

export const LEAD_MAGNET_IDS = LEAD_MAGNETS.map((magnet) => magnet.id);

export function isLeadMagnetId(value: string): value is LeadMagnetId {
  return LEAD_MAGNET_IDS.includes(value as LeadMagnetId);
}

export function getLeadMagnet(value: string): LeadMagnetConfig | undefined {
  return LEAD_MAGNETS.find((magnet) => magnet.id === value);
}

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
