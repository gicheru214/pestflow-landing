export type ConceptId =
  | "guided-concierge"
  | "route-board-live"
  | "chaos-to-control"
  | "switch-with-confidence"
  | "one-dollar-proof"
  | "operator-scorecard"
  | "demo-before-form"
  | "small-team-command"
  | "growth-control-room"
  | "trust-ledger";

export interface LandingConcept {
  id: ConceptId;
  name: string;
  thesis: string;
  audience: string;
  mode: "split" | "centered" | "editorial" | "commerce" | "diagnostic";
  accent: string;
  accentSoft: string;
  ink: string;
  surface: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  trustLine: string;
  proof: Array<{ value: string; label: string }>;
  storyTitle: string;
  storyBody: string;
  productTitle: string;
  productBody: string;
  calendarLabel: string;
  popup: {
    kicker: string;
    headline: string;
    body: string;
    prompt: string;
    options: string[];
    cta: string;
    secondary: string;
  };
}

export type CampaignIntent = "default" | "routes" | "billing" | "field" | "switching";

export const CONCEPTS: LandingConcept[] = [
  {
    id: "guided-concierge",
    name: "Guided Concierge",
    thesis: "Recommended: preserve the popup, but make it a helpful two-step product router instead of a contact wall.",
    audience: "Cold Meta traffic, mixed awareness",
    mode: "split",
    accent: "#4c8f2f",
    accentSoft: "#edf7e8",
    ink: "#152019",
    surface: "#fbfcf9",
    eyebrow: "One question. One real PestFlow workflow.",
    headline: "Fix the workflow",
    highlight: "slowing your team down.",
    body: "Choose the problem. See the exact PestFlow screen that solves it. Then test the real product for $1 or book a 15-minute setup map.",
    primaryCta: "Show me the right workflow",
    secondaryCta: "Book a 15-minute setup",
    trustLine: "$1 today · 7-day trial · Cancel before renewal · Real human setup available",
    proof: [
      { value: "1 question", label: "before we personalize" },
      { value: "$1", label: "to test the real product" },
      { value: "15 min", label: "optional guided setup" },
    ],
    storyTitle: "A cold visitor should feel understood before they feel captured.",
    storyBody: "The popup mirrors WrenchFlow's strongest behavior: a simple routing choice first. It then shows relevant product proof, asks for email only, and offers self-serve or a calendar without forcing either path.",
    productTitle: "Your first win, already mapped",
    productBody: "Routes, recurring billing, technician visibility, reviews, and customer communication stay visible as outcomes, not a generic feature wall.",
    calendarLabel: "Prefer a person? Book a 15-minute setup map",
    popup: {
      kicker: "One quick routing question",
      headline: "What is creating the most drag this week?",
      body: "Pick one. We will show the relevant PestFlow workflow before asking you to do anything else.",
      prompt: "Choose the closest answer",
      options: ["Routes keep changing", "Billing takes too much follow-up", "The office cannot see the field", "Switching software feels risky"],
      cta: "Show my recommended workflow",
      secondary: "I would rather book a quick walkthrough",
    },
  },
  {
    id: "route-board-live",
    name: "Route Board Live",
    thesis: "Lead with the product surface Facebook visitors can understand in five seconds.",
    audience: "Owners frustrated by dispatch and route changes",
    mode: "centered",
    accent: "#287a54",
    accentSoft: "#e7f6ef",
    ink: "#10251b",
    surface: "#f7fbf9",
    eyebrow: "Your Tuesday route. Fixed before the first truck rolls.",
    headline: "Move stops, fill gaps,",
    highlight: "and keep every tech in sync.",
    body: "A visual route board for recurring pest service, live technician status, drive-time decisions, and customer updates in one place.",
    primaryCta: "Build a sample route",
    secondaryCta: "See the route board",
    trustLine: "Use a sample route first · No migration required · $1 activation",
    proof: [
      { value: "Drag", label: "to reschedule" },
      { value: "Live", label: "field visibility" },
      { value: "One view", label: "office and trucks" },
    ],
    storyTitle: "Show, do not announce.",
    storyBody: "This version trades broad growth claims for a legible interactive product moment. The popup asks which routing problem is happening today and opens the matching walkthrough.",
    productTitle: "A route board built around recurring service",
    productBody: "Monthly, quarterly, seasonal, and commercial windows are presented as the reason PestFlow is different from a generic field-service calendar.",
    calendarLabel: "Bring one messy route to a live 15-minute teardown",
    popup: {
      kicker: "Route rescue",
      headline: "Want us to map tomorrow's route with you?",
      body: "Choose the route problem you see most. We will open the exact product view that handles it.",
      prompt: "My recurring problem is",
      options: ["Last-minute cancellations", "Too much windshield time", "Unclear technician status", "Recurring stops getting lost"],
      cta: "Open the route workflow",
      secondary: "Book a route teardown",
    },
  },
  {
    id: "chaos-to-control",
    name: "Chaos to Control",
    thesis: "Use the emotional before-and-after that made WrenchFlow's promise easy to grasp.",
    audience: "Owner-operators buried in texts and spreadsheets",
    mode: "editorial",
    accent: "#ce5b35",
    accentSoft: "#fff0e9",
    ink: "#241914",
    surface: "#fffaf7",
    eyebrow: "The work is not the problem. The handoffs are.",
    headline: "Stop running the company",
    highlight: "from missed texts.",
    body: "PestFlow puts the schedule, route, payment, customer history, and technician handoff into one calm operating view.",
    primaryCta: "See my chaos-to-control plan",
    secondaryCta: "Compare the before and after",
    trustLine: "Keep your current system while you test · Export anytime · No annual contract",
    proof: [
      { value: "5 tools", label: "collapsed into one" },
      { value: "0", label: "forced migration calls" },
      { value: "$1", label: "real-product test" },
    ],
    storyTitle: "Name the mess in the language the owner uses.",
    storyBody: "Instead of 'all-in-one software,' the page shows a day splintered across calls, texts, paper, and payment follow-up, then resolves each handoff into a visible PestFlow workflow.",
    productTitle: "One operating rhythm from first stop to final payment",
    productBody: "The proof sequence follows a day: dispatch, service, documentation, invoice, review request, and tomorrow's recurring schedule.",
    calendarLabel: "Walk us through your current stack. We will map the replacement.",
    popup: {
      kicker: "Clear one bottleneck",
      headline: "Which handoff breaks most often?",
      body: "No generic guide. Pick the mess and see the workflow that replaces it.",
      prompt: "The most frustrating handoff is",
      options: ["Office to technician", "Job complete to invoice", "Invoice to payment", "New lead to scheduled job"],
      cta: "Show the cleaner workflow",
      secondary: "Map it with a person",
    },
  },
  {
    id: "switch-with-confidence",
    name: "Switch With Confidence",
    thesis: "Turn migration anxiety into the primary trust story for established operators.",
    audience: "PestPac, FieldRoutes, GorillaDesk, and spreadsheet switchers",
    mode: "split",
    accent: "#315a9c",
    accentSoft: "#edf3ff",
    ink: "#121c2e",
    surface: "#f8faff",
    eyebrow: "Do not buy software before you know how the switch works",
    headline: "A safer way to leave",
    highlight: "the system you have outgrown.",
    body: "See what moves, what stays, who helps, and how your team tests PestFlow before the old system is touched.",
    primaryCta: "Build my switch plan",
    secondaryCta: "See the migration checklist",
    trustLine: "Parallel test first · Data export plan · Human migration support · No surprise cutoff",
    proof: [
      { value: "Day 0", label: "read-only inventory" },
      { value: "Day 1", label: "sample workflow" },
      { value: "Your call", label: "when to switch" },
    ],
    storyTitle: "The hidden objection is often not price. It is operational risk.",
    storyBody: "This page gives the switching plan more visual weight than the feature list and invites visitors to name their current tool in the popup.",
    productTitle: "Your data and daily routes stay in your control",
    productBody: "A migration timeline replaces anonymous superlatives with concrete steps, owners, and rollback points.",
    calendarLabel: "Book a private migration map for your current system",
    popup: {
      kicker: "Migration planner",
      headline: "What are you switching from?",
      body: "We will show the safest test plan for your current setup.",
      prompt: "Current system",
      options: ["PestPac or FieldRoutes", "GorillaDesk", "Spreadsheets and QuickBooks", "A mix of tools"],
      cta: "Build my switch plan",
      secondary: "Talk through migration risk",
    },
  },
  {
    id: "one-dollar-proof",
    name: "$1 Product Proof",
    thesis: "Make the unusual self-serve advantage the hero instead of hiding it near the bottom.",
    audience: "High-intent owners who distrust demos and sales calls",
    mode: "commerce",
    accent: "#3d8b35",
    accentSoft: "#eef9e9",
    ink: "#142111",
    surface: "#fbfef9",
    eyebrow: "Do not sit through a pitch. Use the product.",
    headline: "Put a real route into PestFlow",
    highlight: "for $1 today.",
    body: "Seven days with the actual route board, billing, GPS, customer portal, and review workflows. Cancel before renewal if it does not earn a place in your operation.",
    primaryCta: "Start the $1 real-product test",
    secondaryCta: "See exactly what happens next",
    trustLine: "$1 charged today · Then your selected plan after 7 days · Cancel online",
    proof: [
      { value: "$1", label: "today" },
      { value: "7 days", label: "full product" },
      { value: "Online", label: "cancellation" },
    ],
    storyTitle: "PestFlow has a proof mechanism WrenchFlow did not: a real micro-commitment.",
    storyBody: "This concept makes billing terms unusually clear and treats the $1 payment as a trust-building product test, not a discount gimmick.",
    productTitle: "A seven-day operating test, not a sandbox",
    productBody: "Visitors see the exact first three actions: create a route, send a test invoice, and invite one technician or office user.",
    calendarLabel: "Want help setting up the $1 test? Pick a time first.",
    popup: {
      kicker: "$1 test planner",
      headline: "What would make the trial worth $1?",
      body: "Choose the proof you need. We will start the trial on that workflow.",
      prompt: "I need to prove",
      options: ["Routing saves time", "Billing gets money in faster", "My techs can actually use it", "Switching will not wreck the week"],
      cta: "Build my 7-day test",
      secondary: "Set up the test with me",
    },
  },
  {
    id: "operator-scorecard",
    name: "Operator Scorecard",
    thesis: "Keep the diagnostic idea, but make it short, credible, and product-specific.",
    audience: "Problem-aware owners who are not yet software-aware",
    mode: "diagnostic",
    accent: "#6b5bd2",
    accentSoft: "#f1efff",
    ink: "#1d1932",
    surface: "#fbfaff",
    eyebrow: "Three questions. One operating priority.",
    headline: "Score the part of your operation",
    highlight: "you cannot see from the truck.",
    body: "Get a short score across route density, payment follow-up, and field visibility, then open the PestFlow workflow tied to the weakest result.",
    primaryCta: "Get my 60-second score",
    secondaryCta: "See the scoring method",
    trustLine: "3 questions · No phone required · Result shown before signup",
    proof: [
      { value: "3", label: "questions" },
      { value: "60 sec", label: "to a result" },
      { value: "1", label: "priority to test" },
    ],
    storyTitle: "Give value before the form.",
    storyBody: "The existing playbook promise is replaced by a transparent mini-diagnostic. Contact capture happens after the score and only if the visitor wants the detailed action plan.",
    productTitle: "Every score opens a real product workflow",
    productBody: "A low route score opens route planning. A low cash score opens recurring billing. A low visibility score opens technician status and documentation.",
    calendarLabel: "Review the score with a PestFlow setup specialist",
    popup: {
      kicker: "60-second operator score",
      headline: "Where do you have the least visibility?",
      body: "Your answer changes the next two questions and the product example we show.",
      prompt: "I have the least confidence in",
      options: ["Tomorrow's route capacity", "What is still unpaid", "What happened in the field", "Whether leads got followed up"],
      cta: "Score my operation",
      secondary: "Skip the score and book a walkthrough",
    },
  },
  {
    id: "demo-before-form",
    name: "Demo Before Form",
    thesis: "Let skeptical visitors inspect the product before contact capture.",
    audience: "Visual evaluators and comparison shoppers",
    mode: "centered",
    accent: "#176e72",
    accentSoft: "#e5f7f7",
    ink: "#102526",
    surface: "#f7fdfd",
    eyebrow: "Ninety seconds inside PestFlow",
    headline: "Watch one pest-control day",
    highlight: "move from route to payment.",
    body: "No voice-over superlatives. See a job move through dispatch, service, documentation, invoice, payment, and review request.",
    primaryCta: "Play the 90-second product tour",
    secondaryCta: "Start a $1 test instead",
    trustLine: "No form before the demo · Chapters by workflow · Captions on",
    proof: [
      { value: "90 sec", label: "full workflow" },
      { value: "6 steps", label: "route to review" },
      { value: "0 forms", label: "before viewing" },
    ],
    storyTitle: "Trust grows when the product bears the claim.",
    storyBody: "The popup becomes a demo chapter picker. After a chapter plays, it offers the matching $1 test or a calendar.",
    productTitle: "Choose the proof you want to see",
    productBody: "Short, captioned chapters are faster than a generic feature tour and preserve message match with different Facebook creatives.",
    calendarLabel: "Book a live version using your workflow",
    popup: {
      kicker: "Choose a product chapter",
      headline: "What do you want to see before you trust us?",
      body: "Pick a chapter. No contact information required to watch.",
      prompt: "Show me",
      options: ["Route board in action", "Recurring billing and failed cards", "Technician field workflow", "Customer portal and reviews"],
      cta: "Play my chapter",
      secondary: "I want a live walkthrough",
    },
  },
  {
    id: "small-team-command",
    name: "Small Team Command",
    thesis: "Remove the $1M-company framing and speak directly to one-to-five-truck operators.",
    audience: "Solo owners and teams with 1–5 trucks",
    mode: "editorial",
    accent: "#b06a18",
    accentSoft: "#fff5e3",
    ink: "#2b2013",
    surface: "#fffcf6",
    eyebrow: "Built for the owner who still answers the phone",
    headline: "Run five trucks",
    highlight: "without building a five-person office.",
    body: "Schedule recurring work, keep technicians moving, charge cards, and answer customers without hiring another coordinator first.",
    primaryCta: "See the small-team setup",
    secondaryCta: "What can I automate first?",
    trustLine: "Starts at one route · Unlimited admin users · Setup help included",
    proof: [
      { value: "1–5", label: "truck focus" },
      { value: "One week", label: "to test" },
      { value: "$1", label: "to begin" },
    ],
    storyTitle: "The current 'scaling past $1M' line may tell the best Facebook prospects they arrived too early.",
    storyBody: "This concept makes the owner-operator feel like the intended customer and frames automation as avoiding premature office overhead.",
    productTitle: "The office layer your current team does not have time to be",
    productBody: "Automated reminders, recurring payments, route changes, and review requests are organized around hours returned to a small team.",
    calendarLabel: "Map a one-to-five-truck setup in 15 minutes",
    popup: {
      kicker: "Small-team setup",
      headline: "How many trucks are you coordinating today?",
      body: "We will show a right-sized setup, not an enterprise demo.",
      prompt: "Current field team",
      options: ["Just me", "2–3 trucks", "4–5 trucks", "6+ and growing"],
      cta: "Show my right-sized setup",
      secondary: "Talk through my setup",
    },
  },
  {
    id: "growth-control-room",
    name: "Growth Control Room",
    thesis: "Serve established operators with operational visibility rather than generic growth language.",
    audience: "Multi-route companies and office managers",
    mode: "split",
    accent: "#1f7a68",
    accentSoft: "#e8f7f3",
    ink: "#0f2520",
    surface: "#f7fcfa",
    eyebrow: "Every route, exception, and dollar in one operating view",
    headline: "Growth feels calmer",
    highlight: "when exceptions have owners.",
    body: "See missed stops, failed cards, route gaps, technician status, and customer follow-up before they become the owner's evening work.",
    primaryCta: "Open the control-room preview",
    secondaryCta: "Book an operations review",
    trustLine: "Role-based views · Audit history · Customer and field workflows connected",
    proof: [
      { value: "Routes", label: "capacity and gaps" },
      { value: "Cash", label: "failures and follow-up" },
      { value: "Field", label: "exceptions and proof" },
    ],
    storyTitle: "Established operators buy exception control, not a longer feature list.",
    storyBody: "The design feels like an operating instrument: quiet, high-density, and focused on what needs attention next.",
    productTitle: "A control room for the work that falls between systems",
    productBody: "The page prioritizes the exception queue, role ownership, and historical proof that sophisticated buyers evaluate during a switch.",
    calendarLabel: "Run a live operations review with your current process",
    popup: {
      kicker: "Operations review",
      headline: "Which exception reaches you too late?",
      body: "Choose one and see how PestFlow surfaces it earlier.",
      prompt: "The late surprise is usually",
      options: ["An inefficient route", "A failed or late payment", "A field issue without documentation", "A lead nobody followed up"],
      cta: "Open the exception workflow",
      secondary: "Book an operations review",
    },
  },
  {
    id: "trust-ledger",
    name: "Trust Ledger",
    thesis: "Replace unverified social proof with unusually concrete product, billing, privacy, and support proof.",
    audience: "Skeptical buyers burned by software promises",
    mode: "commerce",
    accent: "#3b6951",
    accentSoft: "#ecf5f0",
    ink: "#16211b",
    surface: "#fcfdfc",
    eyebrow: "Everything we ask you to trust, documented",
    headline: "Know what happens",
    highlight: "before you enter your email.",
    body: "See the product, the $1 charge, renewal price, cancellation path, support channel, data export promise, and first-week setup before starting.",
    primaryCta: "Review the trial ledger",
    secondaryCta: "See the product without signing up",
    trustLine: "Plain-language billing · Exportable data · Named company · Visible support path",
    proof: [
      { value: "$1", label: "charged today" },
      { value: "Day 8", label: "renewal shown clearly" },
      { value: "Anytime", label: "export and cancel" },
    ],
    storyTitle: "Trust is a stack of verifiable details.",
    storyBody: "This version removes anonymous testimonials and unsupported outcome numbers. It uses real screenshots, transparent terms, company identity, security boundaries, and accessible support instead.",
    productTitle: "A product claim beside the evidence for it",
    productBody: "Each major promise pairs with a screen, workflow, billing term, or support commitment that can be independently checked.",
    calendarLabel: "Ask every skeptical question in a 15-minute call",
    popup: {
      kicker: "No-surprises trial",
      headline: "What would you need to verify first?",
      body: "We will show the evidence before asking for contact information.",
      prompt: "I want proof of",
      options: ["What the product actually does", "What and when I will be charged", "How cancellation and export work", "Who helps if setup gets stuck"],
      cta: "Show the evidence",
      secondary: "Ask a person directly",
    },
  },
];

export const DEFAULT_CONCEPT_ID: ConceptId = "guided-concierge";

export function getConcept(id: string | null): LandingConcept {
  return CONCEPTS.find((concept) => concept.id === id) || CONCEPTS[0];
}

export function withCampaignIntent(concept: LandingConcept, intent: CampaignIntent): LandingConcept {
  if (concept.id !== DEFAULT_CONCEPT_ID || intent === "default") return concept;

  const matches: Record<Exclude<CampaignIntent, "default">, Partial<LandingConcept>> = {
    routes: {
      eyebrow: "You clicked for a calmer route day. Start there.",
      headline: "Tomorrow's route,",
      highlight: "under control.",
      body: "See how recurring stops, last-minute changes, technician status, and customer windows stay connected. Then test that exact workflow for $1.",
      primaryCta: "Show me the route workflow",
    },
    billing: {
      eyebrow: "You clicked for faster payment follow-up. Start there.",
      headline: "Close the job.",
      highlight: "Close the payment loop.",
      body: "See completion, invoice, card collection, failed-payment follow-up, and customer history in one PestFlow workflow. Then test it for $1.",
      primaryCta: "Show me the billing workflow",
    },
    field: {
      eyebrow: "You clicked for a clearer view of the field. Start there.",
      headline: "See every truck.",
      highlight: "Stop chasing updates.",
      body: "See technician status, service proof, notes, photos, and customer updates without chasing the truck by phone. Then test the workflow for $1.",
      primaryCta: "Show me the field workflow",
    },
    switching: {
      eyebrow: "You clicked because switching software feels risky. Start there.",
      headline: "Switch systems.",
      highlight: "Keep the week running.",
      body: "See the parallel-test plan, migration checkpoints, export promise, and human setup path before the old system is touched.",
      primaryCta: "Build my safe switch plan",
    },
  };

  return { ...concept, ...matches[intent] };
}
