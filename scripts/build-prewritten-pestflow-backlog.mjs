import { readFile, writeFile } from "node:fs/promises";

const OUTPUT_PATH = "client/src/content/scheduled-blog-posts-phase-two.json";
const KEYWORDS_PATH = "automation/pestflow-software-keywords.json";
const EXISTING_PATHS = [
  "client/src/content/generated-blog-posts.json",
  "client/src/content/scheduled-blog-posts.json",
];
const AUTHOR = "PestFlow Field Notes";
const START_DAY_UTC = Date.parse("2026-07-12T07:00:00.000Z");
const POSTS_PER_DAY = 10;

const specs = [
  {
    slug: "pest-control-software-pricing",
    keyword: "pest control software pricing",
    secondaryKeywords: ["affordable pest control software", "pest control software free trial"],
    title: "Pest Control Software Pricing: Calculate the Real Cost",
    category: "Software Buying",
    purpose: "compare subscription price with implementation, payment, support, mobile, and operating costs before signing a contract",
    requirements: ["Complete written price for current and expected users", "Implementation and data-migration scope", "Required add-ons and transaction fees", "Renewal, export, and cancellation terms"],
    trial: "price the same real operating workflow in every product: import customers, schedule recurring routes, complete work on a phone, invoice, collect payment, and report on the result",
    risks: ["Low entry price that excludes required modules", "Per-user cost that jumps during hiring", "Payment fees hidden from the software quote", "Expensive migration or data export"],
    migration: ["Inventory every paid tool being replaced", "Count office time spent on handoffs", "Request a line-item implementation plan", "Model cost at next year's technician count"],
    pricing: ["Base subscription", "Office and technician seats", "Payments, messaging, and storage", "Onboarding, support, and export"],
  },
  {
    slug: "free-vs-paid-pest-control-software",
    keyword: "pest control software free",
    secondaryKeywords: ["pest control software for small business free", "pest control scheduling software free"],
    title: "Free vs Paid Pest Control Software for a Small Company",
    category: "Software Buying",
    purpose: "decide when spreadsheets and free tools remain workable and when a connected paid system removes enough risk and labor to justify its cost",
    requirements: ["Recurring customer and service history", "Mobile job completion", "Invoices and payment status", "Reliable exports and backups"],
    trial: "run one week of recurring work in the free setup and record every duplicate entry, missed follow-up, manual message, billing delay, and report rebuilt by the office",
    risks: ["Free tier blocks exports or history", "Separate tools create conflicting customer data", "No audit trail for schedule and payment changes", "Owner time is treated as free"],
    migration: ["Document the current free-tool stack", "Choose the event that triggers an upgrade", "Clean customer and recurrence data", "Pilot before abandoning working records"],
    pricing: ["Monthly cash cost", "Owner and office hours", "Error and collection cost", "Future migration difficulty"],
  },
  {
    slug: "pest-control-software-for-owner-operators",
    keyword: "pest control software for owner operators",
    secondaryKeywords: ["pest control software for 1 to 5 technicians", "pest control CRM for small companies"],
    title: "Pest Control Software for Owner-Operators and Small Teams",
    category: "Software Buying",
    purpose: "give a working owner one system for selling, scheduling, servicing, invoicing, and collecting without creating a full-time office job",
    requirements: ["Fast recurring scheduling", "Complete mobile workflow", "Card and ACH collection", "Simple owner dashboard"],
    trial: "complete a full day from first booking through paid invoice using only the phone and the amount of office help the company actually has",
    risks: ["Enterprise setup burden", "Generic field-service forms", "Features split across costly tiers", "No clean path for adding technicians"],
    migration: ["Start with active recurring customers", "Import balances and payment terms carefully", "Build only the services currently sold", "Train the first technician on real jobs"],
    pricing: ["Solo-owner plan", "Cost of each added technician", "Included automation and support", "Payment and messaging usage"],
  },
  {
    slug: "pest-control-software-for-startups",
    keyword: "pest control software for startups",
    secondaryKeywords: ["pest control business software", "pest control management software"],
    title: "Pest Control Software for Startups: Build the Right Base",
    category: "Software Buying",
    purpose: "set up customer, service, route, billing, and recordkeeping foundations before the startup accumulates inconsistent spreadsheets and manual habits",
    requirements: ["Flexible service templates", "Recurring agreements and next-due dates", "Mobile records and photos", "Professional estimates, invoices, and payments"],
    trial: "create the first residential recurring plan, one commercial account, one callback, one unpaid invoice, and one reschedule before entering the full customer list",
    risks: ["Buying for imagined enterprise needs", "Skipping exports and data ownership", "Building vague service templates", "Ignoring the future office workflow"],
    migration: ["Define naming and required fields", "Create a clean product and service catalog", "Set payment and cancellation rules", "Review the first 25 completed jobs"],
    pricing: ["Minimum monthly commitment", "Startup and training fees", "Growth in seats and contacts", "Included estimates, payments, and reports"],
  },
  {
    slug: "pest-control-software-for-growing-companies",
    keyword: "pest control software for growing companies",
    secondaryKeywords: ["pest control service management software", "pest control field service software"],
    title: "Pest Control Software for a Growing Service Company",
    category: "Software Buying",
    purpose: "replace owner memory with repeatable dispatch, field, billing, customer, and management controls as technician and route count rises",
    requirements: ["Role-based office and field access", "Exception-driven dispatch", "Standard service completion", "Branch-ready reporting"],
    trial: "load a busy week with multiple technicians, callbacks, same-day work, unpaid accounts, and manager approvals instead of evaluating a clean demo calendar",
    risks: ["Processes that work only through one expert", "Reporting that requires exports", "Permissions too broad for a larger team", "Implementation that disrupts recurring revenue"],
    migration: ["Name process owners", "Pilot one route or branch", "Reconcile recurring work and balances", "Measure adoption and exceptions daily"],
    pricing: ["Cost at twice the current team", "Manager and office licenses", "Advanced reporting and automation", "Implementation and priority support"],
  },
  {
    slug: "multi-branch-pest-control-software",
    keyword: "pest control software for multi branch companies",
    secondaryKeywords: ["multi location pest control reporting software", "pest control business intelligence software"],
    title: "Multi-Branch Pest Control Software: Owner Control Without Chaos",
    category: "Analytics Software",
    purpose: "standardize customers, services, financial controls, and performance definitions while preserving local branch accountability",
    requirements: ["Branch and consolidated reporting", "Location-aware permissions", "Shared catalogs with controlled exceptions", "Inter-branch customer and inventory visibility"],
    trial: "run the same service, transfer, customer move, payment, and manager report across two branches and verify both local and company-wide results",
    risks: ["Every branch defines metrics differently", "Managers can see or edit the wrong location", "Duplicate customers and products", "Consolidated totals cannot be traced"],
    migration: ["Choose global and local data owners", "Map branch-specific service codes", "Reconcile duplicates before import", "Roll out in waves with one reporting standard"],
    pricing: ["Branch minimums", "Central and local manager seats", "Data warehouse or API access", "Multi-entity payments and accounting"],
  },
  {
    slug: "all-in-one-pest-control-software-vs-tool-stack",
    keyword: "all in one pest control software",
    secondaryKeywords: ["best pest control software", "pest control software API integrations", "pest control data export software"],
    title: "All-in-One Pest Control Software vs a Connected Tool Stack",
    category: "Software Buying",
    purpose: "choose deliberately between one operating platform and several specialized tools by measuring data ownership, workflow handoffs, flexibility, and total administration",
    requirements: ["One customer and service identity", "Reliable integration failure handling", "Permission and audit consistency", "Complete export strategy"],
    trial: "change one customer, route, invoice, payment, and cancellation across the proposed stack and observe where data waits, duplicates, or loses ownership",
    risks: ["All-in-one module is too shallow", "Integrations silently stop syncing", "Multiple vendors blame each other", "Critical history cannot be exported"],
    migration: ["Diagram the current source of truth", "Remove duplicate systems", "Test failure and retry behavior", "Assign an owner to each integration"],
    pricing: ["Platform and add-on subscriptions", "Integration or automation usage", "Administration and reconciliation time", "Switching and export cost"],
  },
  {
    slug: "recurring-pest-control-scheduling-software",
    keyword: "pest control recurring service scheduling software",
    secondaryKeywords: ["pest control self scheduling software"],
    title: "Recurring Pest Control Scheduling Software: Protect Every Visit",
    category: "Operations Software",
    purpose: "keep agreement frequency, next-due dates, technician capacity, seasonal rules, and customer windows aligned without rebuilding recurring routes manually",
    requirements: ["Flexible recurrence rules", "Overdue and unscheduled exception lists", "Route and technician assignment", "Safe bulk schedule changes"],
    trial: "create monthly, quarterly, seasonal, weekday-only, and commercial-window agreements, then reschedule a route without losing the future series",
    risks: ["Moving one visit changes the whole series", "Overdue work disappears", "Renewals create duplicate jobs", "Bulk edits lack an audit trail"],
    migration: ["Reconcile every next-due date", "Separate frequency from preferred day", "Pilot unusual agreements", "Compare future workload by week"],
    pricing: ["Recurring customer limits", "Route planning module", "Automated reminders", "Bulk tools and implementation help"],
  },
  {
    slug: "pest-control-route-optimization-and-density-software",
    keyword: "pest control route optimization software",
    secondaryKeywords: ["pest control route planning software", "pest control route density software", "pest control technician tracking software"],
    title: "Pest Control Route Optimization and Density Software",
    category: "Operations Software",
    purpose: "improve drive time and route density without breaking customer promises, technician skills, recurring cadence, or commercial service windows",
    requirements: ["Real service durations", "Customer and contract constraints", "Technician skills and start points", "Explainable route changes"],
    trial: "optimize one real week, then compare planned miles, promised windows, overtime, recurring cadence, and dispatcher corrections with the original routes",
    risks: ["Shortest route violates service commitments", "Bad duration data corrupts the plan", "Optimization hides manual overrides", "Density improves while retention falls"],
    migration: ["Clean addresses and geocodes", "Set realistic service durations", "Document hard and soft constraints", "Pilot flexible residential work first"],
    pricing: ["Per-route or per-vehicle fees", "Optimization frequency", "Traffic and GPS modules", "Dispatcher and manager access"],
  },
  {
    slug: "offline-pest-control-technician-app",
    keyword: "offline pest control technician app",
    secondaryKeywords: ["pest control mobile workforce management software", "pest control field service mobile app"],
    title: "Offline Pest Control Technician App: What Must Still Work",
    category: "Operations Software",
    purpose: "let technicians access assignments and complete reliable service records when cellular coverage is weak without creating silent sync conflicts",
    requirements: ["Preloaded jobs and history", "Offline forms, products, photos, and signatures", "Visible sync state", "Conflict and retry controls"],
    trial: "put the phone in airplane mode before opening a job, complete the full service, change the assignment in the office, reconnect, and inspect the result",
    risks: ["Offline means view-only", "Photos appear saved but never upload", "Old instructions overwrite new ones", "Technicians repeat actions after unclear sync"],
    migration: ["Identify weak-coverage routes", "Define preload timing", "Train on pending and failed states", "Review sync exceptions every morning"],
    pricing: ["Offline access tier", "Storage and photo limits", "Supported devices", "Mobile support and replacement workflow"],
  },
  {
    slug: "pest-control-inventory-management-software",
    keyword: "pest control inventory management software",
    secondaryKeywords: ["pest control product usage software", "pesticide usage tracking software"],
    title: "Pest Control Inventory Management Software: Trust the Quantity",
    category: "Compliance Software",
    purpose: "connect purchasing, receiving, warehouse stock, truck transfers, job usage, counts, and adjustments in one believable inventory ledger",
    requirements: ["Location-based quantities", "Service-linked product use", "Controlled units and conversions", "Variance and low-stock exceptions"],
    trial: "receive a partial order, load two trucks, use products on jobs, transfer stock, count a truck, correct a variance, and inspect the audit history",
    risks: ["Quantities change without movements", "Package and usage units are mixed", "Technicians record use outside the ledger", "Adjustments erase the reason"],
    migration: ["Clean the active product catalog", "Define receiving and usage units", "Choose an opening count date", "Enforce movements after go-live"],
    pricing: ["Locations and user limits", "Barcode and purchasing modules", "Chemical records and exports", "Catalog setup and support"],
  },
  {
    slug: "pest-control-sds-document-software",
    keyword: "pest control SDS document software",
    secondaryKeywords: ["pest control compliance record software"],
    title: "Pest Control SDS Document Software for Field Access",
    category: "Compliance Software",
    purpose: "keep approved product documents organized, current, searchable, and available to the field while preserving catalog ownership and version history",
    requirements: ["Product-linked documents", "Effective and retired versions", "Mobile and offline access", "Controlled catalog updates"],
    trial: "replace one product document, verify the field app shows the new version, confirm the old service record keeps its history, and export the catalog",
    risks: ["Duplicate products carry different files", "Old documents remain active", "Technicians cannot access files offline", "Vendor links disappear after cancellation"],
    migration: ["Inventory active products", "Assign a catalog owner", "Remove duplicates and inactive items", "Document the review schedule"],
    pricing: ["Document storage", "Offline mobile access", "Catalog maintenance", "Export and retention"],
  },
  {
    slug: "pest-control-compliance-record-software",
    keyword: "pest control compliance record software",
    secondaryKeywords: ["commercial pest control reporting software"],
    title: "Pest Control Compliance Record Software: Build an Audit Trail",
    category: "Compliance Software",
    purpose: "make service, product, technician, property, correction, and customer records consistent and retrievable without claiming software replaces local compliance judgment",
    requirements: ["Configurable required fields", "Permanent edit history", "Searchable service and product records", "Reliable exports and retention"],
    trial: "complete a service, correct a product and quantity after delivery, identify both versions, and export the account history with timestamps and users",
    risks: ["One template is used for every jurisdiction", "Corrections replace original values", "Reports omit underlying detail", "Retention depends on an active subscription"],
    migration: ["Have the responsible license holder review fields", "Map legacy records by value", "Test corrections and exports", "Schedule periodic configuration review"],
    pricing: ["Custom forms", "Audit history", "Document retention", "Compliance exports and implementation"],
  },
  {
    slug: "pest-control-online-booking-and-self-scheduling",
    keyword: "pest control online booking software",
    secondaryKeywords: ["pest control self scheduling software", "pest control after hours booking software"],
    title: "Pest Control Online Booking and Self-Scheduling Software",
    category: "CRM Software",
    purpose: "let qualified customers request or book work without creating impossible promises, duplicate records, weak route density, or services the company does not sell",
    requirements: ["Service-area and job qualification", "Real capacity and window controls", "Existing-customer matching", "Deposit and confirmation workflow"],
    trial: "book a new lead, an existing customer, an out-of-area request, an urgent job, and a service requiring inspection, then inspect the office workload",
    risks: ["Any visitor can claim any time", "Duplicate customer records", "Booking ignores route geography", "Unqualified work reaches dispatch"],
    migration: ["Define bookable services", "Set qualification and service areas", "Reserve realistic capacity", "Review conversion and reschedule rates"],
    pricing: ["Booking volume", "Website widget", "Text and email confirmation", "Payments and lead-source tracking"],
  },
  {
    slug: "pest-control-appointment-reminder-software",
    keyword: "pest control appointment reminder software",
    secondaryKeywords: ["pest control automated follow up software"],
    title: "Pest Control Appointment Reminder Software That Reduces Misses",
    category: "CRM Software",
    purpose: "send the right confirmation, reminder, en-route message, and follow-up based on service status instead of blasting every customer from a disconnected calendar",
    requirements: ["Job-aware message triggers", "Customer channel preferences", "Reply and failure visibility", "Template and consent controls"],
    trial: "reschedule, cancel, reassign, and complete real test jobs while checking what the customer receives and whether replies reach the responsible office user",
    risks: ["Old reminders send after a change", "Replies land in an unmonitored inbox", "Every service uses the same wording", "Delivery cost grows unexpectedly"],
    migration: ["Clean phone and email fields", "Define timing by service type", "Assign reply ownership", "Monitor failures during rollout"],
    pricing: ["Included messages", "SMS and email overages", "Two-way reply handling", "Automation tier"],
  },
  {
    slug: "pest-control-texting-software",
    keyword: "pest control two way texting software",
    secondaryKeywords: ["pest control mass texting software", "pest control customer communication software"],
    title: "Pest Control Texting Software: Two-Way and Mass Messaging",
    category: "CRM Software",
    purpose: "keep customer conversations attached to the right contact, property, job, and employee while separating service messages from approved campaigns",
    requirements: ["Shared but accountable inbox", "Customer and job context", "Assignment and unread controls", "Consent, opt-out, and campaign separation"],
    trial: "handle a reschedule, photo reply, billing question, opt-out, and approved customer campaign from start to resolution without losing ownership",
    risks: ["Messages live on personal phones", "Multiple employees reply", "Mass sends ignore consent", "Conversation history is not exportable"],
    migration: ["Choose company numbers", "Import consent carefully", "Define inbox ownership", "Create escalation and response standards"],
    pricing: ["Numbers and users", "Message segments and media", "Campaign limits", "Calling and CRM bundle"],
  },
  {
    slug: "pest-control-review-and-reputation-software",
    keyword: "pest control review automation software",
    secondaryKeywords: ["pest control reputation management software", "pest control automated review request software"],
    title: "Pest Control Review Automation and Reputation Software",
    category: "CRM Software",
    purpose: "request feedback after the right completed services, route unhappy customers to resolution, and measure review performance without manipulating or selectively hiding legitimate feedback",
    requirements: ["Completion-based triggers", "Customer and technician attribution", "Reply and escalation workflow", "Location-level reporting"],
    trial: "complete successful, callback, canceled, and unpaid test jobs and confirm which requests send, which pause, and how the office follows up",
    risks: ["Requests send after bad outcomes", "Review gating creates policy risk", "Responses lack customer context", "Branches compete for ownership"],
    migration: ["Connect verified profiles", "Define eligible service outcomes", "Assign response owners", "Measure requests, reviews, and recovery separately"],
    pricing: ["Locations and profiles", "SMS and email volume", "Response tools", "CRM and campaign bundle"],
  },
  {
    slug: "pest-control-customer-history-software",
    keyword: "pest control customer history software",
    secondaryKeywords: ["pest control customer management software", "pest control CRM software", "commercial pest control customer portal software"],
    title: "Pest Control Customer History Software: One Account Record",
    category: "CRM Software",
    purpose: "give office and field teams a shared view of contacts, properties, agreements, services, products, communications, invoices, payments, callbacks, and recommendations",
    requirements: ["Separate customer and property records", "Chronological service history", "Searchable communication and billing", "Role-based internal notes"],
    trial: "open one complex multi-property customer and answer service, product, balance, communication, and next-step questions without changing systems",
    risks: ["Everything is stored as notes", "Contacts and properties are merged", "History cannot be searched", "Sensitive notes appear to customers"],
    migration: ["Deduplicate contacts and properties", "Preserve external IDs", "Choose structured history to import", "Validate complex accounts first"],
    pricing: ["Customer and property limits", "Historical storage", "Portal and communication", "Import and export services"],
  },
  {
    slug: "pest-control-lead-management-software",
    keyword: "pest control lead management software",
    secondaryKeywords: ["pest control sales pipeline software"],
    title: "Pest Control Lead Management and Sales Pipeline Software",
    category: "CRM Software",
    purpose: "move qualified opportunities from first contact through inspection, estimate, follow-up, agreement, scheduling, and won or lost analysis",
    requirements: ["Lead source and service need", "Owner and next action", "Estimate and communication history", "Won, lost, and stalled reporting"],
    trial: "enter leads from phone, web, referral, and commercial prospecting, then follow each through a different sales outcome and inspect the pipeline",
    risks: ["Pipeline stops at estimate sent", "No required next action", "Duplicates split customer context", "Sales reporting ignores actual revenue"],
    migration: ["Define stages and exit criteria", "Import only actionable leads", "Assign aging and follow-up rules", "Connect won work to operations"],
    pricing: ["Sales users", "Calling and texting", "Automation and sequences", "Forms and lead-source integrations"],
  },
  {
    slug: "pest-control-recurring-billing-and-autopay-software",
    keyword: "pest control recurring billing software",
    secondaryKeywords: ["pest control autopay software", "pest control failed payment automation", "pest control billing software"],
    title: "Pest Control Recurring Billing, Autopay, and Failed Payments",
    category: "Billing Software",
    purpose: "connect agreement terms, service completion, recurring charges, stored payment methods, retries, notices, and account status without accidental double billing",
    requirements: ["Flexible billing schedules", "Service and agreement connection", "Failed-payment retry workflow", "Customer-visible balance history"],
    trial: "run monthly, per-service, quarterly, prepaid, paused, canceled, failed, and refunded accounts through a complete billing cycle",
    risks: ["Billing cadence differs from service cadence", "Retries duplicate charges", "Canceled agreements keep billing", "Card updates do not reach the account"],
    migration: ["Reconcile balances and credits", "Map billing and service frequency separately", "Migrate tokens through approved methods", "Pilot a small billing group"],
    pricing: ["Subscription and payment fees", "Card update and retry tools", "ACH pricing", "Migration and support"],
  },
  {
    slug: "pest-control-payment-processing-and-ach-software",
    keyword: "pest control payment processing software",
    secondaryKeywords: ["pest control ACH payment software"],
    title: "Pest Control Payment Processing and ACH Software",
    category: "Billing Software",
    purpose: "collect deposits, service payments, recurring charges, cards, and ACH while keeping fees, refunds, disputes, deposits, and invoice status traceable",
    requirements: ["Invoice-linked transactions", "Card and ACH options", "Refund and dispute history", "Deposit reconciliation"],
    trial: "collect a deposit, card payment, ACH payment, recurring charge, partial refund, failed payment, and dispute, then reconcile the bank deposit",
    risks: ["Low headline rate excludes fees", "Payment status does not update invoices", "Refunds lose job context", "Merchant lock-in blocks migration"],
    migration: ["Verify the merchant account", "Map open balances", "Plan token migration", "Reconcile the first deposits daily"],
    pricing: ["Card rate and fixed fee", "ACH fee and return cost", "Chargeback and instant payout", "Gateway, token, and software fees"],
  },
  {
    slug: "pest-control-estimating-quoting-and-esignature-software",
    keyword: "pest control estimating software",
    secondaryKeywords: ["pest control quoting software", "pest control e signature software", "pest control service agreement software"],
    title: "Pest Control Estimating, Quoting, and E-Signature Software",
    category: "Billing Software",
    purpose: "turn a qualified scope into clear options, pricing, approval, agreement terms, deposit, and scheduled work without retyping customer or service details",
    requirements: ["Reusable but controlled service options", "Scope, exclusions, and terms", "Electronic approval and audit trail", "Estimate-to-job conversion"],
    trial: "build residential, termite, exclusion, and commercial proposals, revise one, approve one on a phone, collect a deposit, and create the work",
    risks: ["Templates overwrite custom scope", "Signatures are detached files", "Approved pricing changes during conversion", "Follow-up stops after sending"],
    migration: ["Standardize services and terms", "Assign pricing authority", "Import active proposals", "Review the first converted jobs"],
    pricing: ["Estimate and signature limits", "Proposal options and attachments", "Payment collection", "Sales automation"],
  },
  {
    slug: "pest-control-quickbooks-integration-software",
    keyword: "pest control software with QuickBooks integration",
    secondaryKeywords: ["pest control invoicing software"],
    title: "Pest Control Software With QuickBooks Integration",
    category: "Billing Software",
    purpose: "define which system owns customers, invoices, payments, taxes, deposits, products, and financial reporting so synchronization does not create duplicates",
    requirements: ["Documented direction for each record", "Duplicate and failure controls", "Payment and deposit mapping", "Reconciliation reporting"],
    trial: "create, edit, pay, refund, and void transactions on the approved side of the integration, then inspect both systems and the bank deposit",
    risks: ["Both systems create invoices", "Edits do not sync consistently", "Payments duplicate during retry", "Product and tax codes drift"],
    migration: ["Choose the accounting source of truth", "Clean customers and items", "Test in a limited date range", "Reconcile every day during launch"],
    pricing: ["Integration tier", "Connector subscription", "Setup and cleanup", "Accounting support"],
  },
  {
    slug: "pest-control-expense-and-job-cost-software",
    keyword: "pest control expense tracking software",
    secondaryKeywords: ["pest control route profitability software"],
    title: "Pest Control Expense Tracking and Job Cost Software",
    category: "Analytics Software",
    purpose: "connect revenue with labor, drive time, materials, commissions, callbacks, and overhead assumptions to compare service and account economics",
    requirements: ["Service-linked material and labor", "Consistent overhead rules", "Callback and warranty treatment", "Account and route profitability views"],
    trial: "cost one profitable recurring route, one long-drive account, one callback-heavy customer, and one specialty job using the same assumptions",
    risks: ["Only direct material is counted", "Drive and callback time disappear", "Revenue is recognized inconsistently", "Precision hides weak source data"],
    migration: ["Define cost assumptions", "Connect time and product data", "Start with directional decisions", "Review exceptions with managers"],
    pricing: ["Accounting connection", "Time and GPS modules", "Advanced analytics", "Export and consulting"],
  },
  {
    slug: "pest-control-technician-commission-software",
    keyword: "pest control technician commission software",
    secondaryKeywords: ["pest control technician performance reporting software"],
    title: "Pest Control Technician Commission Software and Controls",
    category: "Analytics Software",
    purpose: "calculate transparent compensation from approved services, sales, collections, callbacks, quality, or production rules without relying on private spreadsheets",
    requirements: ["Versioned compensation rules", "Traceable job-level calculations", "Manager approval and adjustment history", "Technician statement access"],
    trial: "calculate normal work, add-on sales, team jobs, callbacks, refunds, cancellations, partial collections, and a rule change across a pay period",
    risks: ["Rules change historical earnings", "Refunds and callbacks are inconsistent", "Technicians cannot verify statements", "Payroll totals lack job detail"],
    migration: ["Document every current plan", "Choose effective dates", "Parallel-run one pay period", "Resolve edge cases before launch"],
    pricing: ["Payroll or commission module", "Technician access", "Custom rule setup", "Exports and integrations"],
  },
  {
    slug: "pest-control-kpi-owner-dashboard",
    keyword: "pest control KPI dashboard software",
    secondaryKeywords: ["pest control owner dashboard software", "pest control revenue reporting software"],
    title: "Pest Control KPI Dashboard Software for Owners",
    category: "Analytics Software",
    purpose: "turn daily exceptions and consistent definitions into owner decisions instead of displaying attractive charts that cannot be traced to customers, jobs, and payments",
    requirements: ["Documented metric definitions", "Drill-down to source records", "Daily exception queues", "Branch, route, and technician views"],
    trial: "reconcile scheduled, completed, invoiced, collected, overdue, canceled, callback, and churn figures against a known operating week",
    risks: ["Metrics use different date logic", "Dashboards hide source records", "Revenue is confused with collections", "Managers optimize one number"],
    migration: ["Agree on definitions", "Validate a closed period", "Assign metric owners", "Start with a small decision set"],
    pricing: ["Advanced reporting tier", "Manager licenses", "Historical retention", "Custom dashboards and BI export"],
  },
  {
    slug: "pest-control-technician-performance-software",
    keyword: "pest control technician performance reporting software",
    secondaryKeywords: ["pest control mobile workforce management software"],
    title: "Pest Control Technician Performance Reporting Software",
    category: "Analytics Software",
    purpose: "combine production, quality, route, customer, documentation, callback, and collection context so coaching does not reward speed at the expense of service",
    requirements: ["Balanced performance measures", "Comparable service context", "Job-level drill-down", "Coaching and follow-up ownership"],
    trial: "compare technicians with different routes, service mixes, tenure, commercial loads, callbacks, and drive times before accepting the ranking",
    risks: ["Stops per day becomes the only goal", "Hard routes look like poor performance", "Missing data becomes zero performance", "Reports punish documentation time"],
    migration: ["Define coaching questions", "Segment comparable work", "Validate source data", "Introduce reports with technician context"],
    pricing: ["Reporting tier", "GPS and time modules", "Manager access", "Historical and custom exports"],
  },
  {
    slug: "pest-control-churn-and-customer-lifetime-value-software",
    keyword: "pest control churn reporting software",
    secondaryKeywords: ["pest control customer lifetime value software"],
    title: "Pest Control Churn and Customer Lifetime Value Software",
    category: "Analytics Software",
    purpose: "define active, paused, canceled, lost, reactivated, and transferred customers consistently so retention work targets real revenue risk",
    requirements: ["Agreement and service status history", "Cancellation reason and effective date", "Cohort and service segmentation", "Traceable lifetime revenue and cost"],
    trial: "classify seasonal pauses, non-renewals, service transfers, failed-payment stops, callbacks, and reactivations, then reconcile the resulting counts",
    risks: ["Any gap is called churn", "Lost customers remain active", "Lifetime value ignores margin", "Reasons are optional free text"],
    migration: ["Define lifecycle states", "Clean cancellation reasons", "Backfill only reliable history", "Create retention owners and actions"],
    pricing: ["Retention analytics", "Historical data", "Automation and campaigns", "BI export"],
  },
  {
    slug: "pest-control-business-intelligence-software",
    keyword: "pest control business intelligence software",
    secondaryKeywords: ["multi location pest control reporting software", "pest control data export software"],
    title: "Pest Control Business Intelligence and Multi-Location Reporting",
    category: "Analytics Software",
    purpose: "create a governed reporting layer for branches, acquisitions, service lines, and financial views without detaching management numbers from operating records",
    requirements: ["Consistent company-wide dimensions", "Scheduled and documented data refresh", "Source-system reconciliation", "Role-based report access"],
    trial: "reconcile one month by branch, service, route, customer status, invoice, payment, and callback, then trace several totals back to source records",
    risks: ["Branches map data differently", "Refresh failures remain invisible", "Spreadsheets become a shadow warehouse", "Acquisition history is overwritten"],
    migration: ["Create a metric dictionary", "Map legacy and branch codes", "Validate closed periods", "Assign data ownership"],
    pricing: ["Warehouse and connector cost", "Viewer and builder licenses", "Refresh frequency", "Implementation and ongoing governance"],
  },
  {
    slug: "pest-control-api-and-data-export-guide",
    keyword: "pest control software API integrations",
    secondaryKeywords: ["pest control data export software"],
    title: "Pest Control Software APIs and Data Exports: Owner Guide",
    category: "Analytics Software",
    purpose: "protect data access and integration flexibility by testing supported objects, history, limits, authentication, errors, and full export before the company depends on the platform",
    requirements: ["Documented API objects and limits", "Incremental and full export", "Stable identifiers and timestamps", "Error, retry, and audit visibility"],
    trial: "create and change a customer, property, agreement, job, invoice, payment, and note, then verify every required field through the supported interface",
    risks: ["API is read-only or incomplete", "Exports omit attachments and history", "Rate limits block operations", "Identifiers change during migration"],
    migration: ["List required data objects", "Test representative complex records", "Design retry and monitoring", "Store ownership and credentials safely"],
    pricing: ["API access tier", "Connector and usage fees", "Export services", "Developer and monitoring cost"],
  },
  {
    slug: "ai-receptionist-for-pest-control-companies",
    keyword: "AI receptionist for pest control companies",
    secondaryKeywords: ["pest control answering service software", "pest control after hours booking software"],
    title: "AI Receptionist for Pest Control Companies: Buying Checklist",
    category: "AI Software",
    purpose: "answer routine calls, qualify requests, collect accurate details, and create controlled next steps without inventing prices, promises, or safety advice",
    requirements: ["Pest-specific call qualification", "Clear escalation and emergency rules", "CRM and booking connection", "Recording, transcript, and consent controls"],
    trial: "call with a new lead, existing-customer reschedule, billing question, commercial request, urgent concern, unsupported service, and angry callback",
    risks: ["AI promises unavailable times", "Pricing is invented", "Existing customers become duplicates", "Urgent or sensitive calls are not escalated"],
    migration: ["Write call policies", "Define services and boundaries", "Connect a test number", "Review every early call"],
    pricing: ["Minutes and calls", "Phone numbers", "Booking and CRM integration", "Human transfer and overage"],
  },
  {
    slug: "pest-control-call-routing-and-tracking-software",
    keyword: "pest control intelligent call routing software",
    secondaryKeywords: ["pest control call tracking software"],
    title: "Pest Control Call Routing and Tracking Software",
    category: "AI Software",
    purpose: "route callers by need, customer status, location, language, availability, and urgency while preserving source, outcome, recording, and follow-up ownership",
    requirements: ["Customer-aware routing", "Missed-call and voicemail workflow", "Lead-source attribution", "Recording and consent configuration"],
    trial: "call during office hours, after hours, from a known customer, from an ad number, with no answer, and with an escalation request",
    risks: ["Complex menus increase abandonment", "Tracking numbers break local listings", "Missed calls lack ownership", "Recordings are retained without policy"],
    migration: ["Inventory all public numbers", "Map routing and fallback", "Test listings and campaigns", "Monitor abandonment and missed follow-up"],
    pricing: ["Numbers and minutes", "Recording and transcription", "Tracking pools", "AI and CRM features"],
  },
  {
    slug: "pest-control-email-and-follow-up-automation",
    keyword: "pest control email automation software",
    secondaryKeywords: ["pest control automated follow up software"],
    title: "Pest Control Email and Follow-Up Automation Software",
    category: "AI Software",
    purpose: "trigger relevant estimate, service, payment, renewal, and reactivation follow-up from real customer status instead of maintaining disconnected bulk sequences",
    requirements: ["Operational trigger data", "Suppression and stop conditions", "Owner and next-action visibility", "Delivery and reply tracking"],
    trial: "send follow-up for open estimates, completed services, unpaid invoices, renewals, canceled customers, and replies, then change each underlying status",
    risks: ["Messages continue after conversion", "Billing and marketing overlap", "Replies lack ownership", "Bad addresses damage delivery"],
    migration: ["Define eligible audiences", "Clean contact and status data", "Start with one sequence", "Review replies and suppression daily"],
    pricing: ["Contacts and sends", "Automation tier", "SMS add-on", "CRM and deliverability tools"],
  },
  {
    slug: "pest-control-marketing-automation-and-sales-pipeline",
    keyword: "pest control marketing automation software",
    secondaryKeywords: ["pest control sales pipeline software"],
    title: "Pest Control Marketing Automation and Sales Pipeline Software",
    category: "AI Software",
    purpose: "connect campaigns to qualified leads, estimates, won work, recurring value, and lost reasons so owners can distinguish activity from profitable acquisition",
    requirements: ["Source and campaign attribution", "Lead-to-customer connection", "Revenue and service outcome", "Consent and audience controls"],
    trial: "run a small approved campaign and trace delivered messages, responses, leads, estimates, won jobs, recurring agreements, and opt-outs",
    risks: ["Clicks are treated as revenue", "Duplicate contacts receive multiple campaigns", "Sales and service statuses conflict", "Automation ignores opt-outs"],
    migration: ["Clean sources and audiences", "Define funnel stages", "Connect closed revenue", "Launch with a measured segment"],
    pricing: ["Contacts and sends", "Calling and texting", "Pipeline users", "Attribution and reporting"],
  },
  {
    slug: "switch-from-spreadsheets-to-pest-control-software",
    keyword: "switch from spreadsheets to pest control software",
    secondaryKeywords: ["pest control CRM implementation checklist"],
    title: "Switch From Spreadsheets to Pest Control Software",
    category: "Software Migration",
    purpose: "move active customers, recurring services, balances, routes, records, and responsibilities into one operating system without importing every inconsistency",
    requirements: ["Clean customer and property structure", "Verified next-due dates", "Open balance reconciliation", "Named source of truth and cutover"],
    trial: "migrate one representative route and run scheduling, service, billing, payment, and reporting while the spreadsheet remains read-only for comparison",
    risks: ["Every column is imported without meaning", "Two systems stay editable", "Recurring work is duplicated", "Owner knowledge is not documented"],
    migration: ["Inventory files and owners", "Choose active data", "Clean and map fields", "Cut over with reconciliation"],
    pricing: ["Import services", "Training and setup", "Parallel-operation time", "Historical storage and export"],
  },
  {
    slug: "pest-control-software-data-migration-checklist",
    keyword: "pest control software data migration checklist",
    secondaryKeywords: ["migrate from GorillaDesk to another pest control CRM", "migrate from FieldRoutes to another pest control CRM", "migrate from PestPac to another pest control CRM", "migrate from Jobber to pest control software"],
    title: "Pest Control Software Data Migration Checklist",
    category: "Software Migration",
    purpose: "protect recurring revenue and field context by mapping, cleaning, importing, validating, and reconciling the records that actually run the business",
    requirements: ["Customer, property, and contact relationships", "Agreements and future service", "Invoices, balances, and payment references", "Service, product, photo, and communication history"],
    trial: "import a representative sample containing multi-property customers, unusual recurrence, credits, callbacks, attachments, and inactive records before the final cutover",
    risks: ["Customer count is used as the only success metric", "Future jobs are missing or duplicated", "Balances lose their source", "Attachments arrive without context"],
    migration: ["Export and preserve raw source data", "Create a field map", "Validate totals and samples", "Freeze, cut over, and reconcile"],
    pricing: ["Vendor import scope", "Historical records", "Custom transformation", "Post-launch correction support"],
  },
  {
    slug: "pest-control-software-implementation-checklist",
    keyword: "pest control software onboarding checklist",
    secondaryKeywords: ["pest control CRM implementation checklist"],
    title: "Pest Control Software Implementation and Onboarding Checklist",
    category: "Software Migration",
    purpose: "turn purchased features into adopted operating workflows with owners, configuration, training, pilots, cutover, reconciliation, and measurable support",
    requirements: ["Executive and process ownership", "Configured services and permissions", "Role-based training", "Pilot, cutover, and adoption measures"],
    trial: "run a complete route and office day with real users before company-wide launch, including exceptions rather than only happy-path jobs",
    risks: ["Implementation is treated as data import", "Training happens before configuration", "No one owns exceptions", "The old system remains the real system"],
    migration: ["Name owners and decisions", "Configure the minimum viable workflow", "Pilot and correct", "Cut over with daily review"],
    pricing: ["Implementation package", "Training sessions", "Data work", "Post-launch support and changes"],
  },
  {
    slug: "pest-control-software-demo-questions-and-roi",
    keyword: "questions to ask during a pest control software demo",
    secondaryKeywords: ["pest control software ROI calculator"],
    title: "Pest Control Software Demo Questions and ROI Calculator",
    category: "Software Buying",
    purpose: "replace feature-list shopping with live workflow proof and a conservative return model based on time, collection, capacity, retention, and avoided errors",
    requirements: ["Real-company scenario demonstration", "Written complete pricing", "Implementation and support evidence", "Export and contract review"],
    trial: "give every vendor the same customer, route, callback, estimate, service, product, invoice, failed payment, correction, and owner-report scenario",
    risks: ["Demo uses prepared sample data", "ROI assumes impossible labor cuts", "Roadmap features are counted as live", "Switching cost is ignored"],
    migration: ["Document the current baseline", "Choose measurable problems", "Score evidence consistently", "Model conservative adoption"],
    pricing: ["Total first-year cost", "Steady-state annual cost", "Implementation labor", "Expected measurable benefit"],
  },
];

const comparisonHubs = [
  {
    slug: "pest-control-software-alternatives-guide",
    keyword: "pest control software alternatives",
    secondaryKeywords: ["Briostack alternatives", "Jobber alternative for pest control", "Housecall Pro alternative for pest control", "QuoteIQ alternative for pest control", "ServiceTitan alternative for pest control", "Pocomos alternative for pest control", "Fieldwork alternative for pest control", "FieldRoutes alternative for pest control", "PestPac alternatives"],
    title: "Pest Control Software Alternatives: Owner Comparison Guide",
    category: "Software Comparison",
    purpose: "compare specialized and general field-service platforms by company size, recurring operations, field records, billing, reporting, migration, support, and complete cost without producing a thin page for every vendor name",
    requirements: ["Current pain and must-keep workflows", "Comparable vendor demonstrations", "Data migration and contract evidence", "Measurable reason to switch"],
    trial: "run one representative customer, recurring route, field service, invoice, payment, exception, correction, export, and owner report in every serious replacement candidate",
    risks: ["Switching because of one incident", "Using brand lists instead of workflow proof", "Losing recurrence and history detail", "Comparing incomplete plan prices"],
    migration: ["Export and inspect the current system", "Score the same scenario", "Pilot representative records", "Reconcile before canceling the old platform"],
    pricing: ["Current complete cost", "Candidate complete cost", "Migration and overlap", "Expected measurable improvement"],
  },
  {
    slug: "pest-control-software-head-to-head-comparison",
    keyword: "pest control software comparison",
    secondaryKeywords: ["GorillaDesk vs FieldRoutes", "GorillaDesk vs PestPac", "FieldRoutes vs PestPac", "Jobber vs GorillaDesk for pest control", "Housecall Pro vs GorillaDesk for pest control", "Jobber vs FieldRoutes for pest control", "PestPac vs Briostack", "QuoteIQ vs GorillaDesk", "PestFlow vs GorillaDesk", "PestFlow vs FieldRoutes"],
    title: "Pest Control Software Head-to-Head Comparison Scorecard",
    category: "Software Comparison",
    purpose: "compare any two pest-control platforms against the same documented operating scenario while verifying current features, plan levels, implementation, support, contract terms, and data access directly",
    requirements: ["Scheduling, routing, and dispatch proof", "Technician and compliance workflow proof", "Billing, payments, and customer experience", "Reporting, migration, support, and total cost"],
    trial: "ask both vendors to run the same customer, recurring route, same-day change, field record, invoice, failed payment, correction, export, and owner report without substituting prepared sample results",
    risks: ["Selecting from reputation alone", "Treating roadmap items as live", "Comparing different plan levels", "Ignoring migration and exit terms"],
    migration: ["Document current pain and must-keep work", "Score identical live scenarios", "Validate a sample migration", "Review price and exit terms in writing"],
    pricing: ["Comparable required plans", "Users, payments, and messages", "Implementation and overlap", "Support, renewal, and export"],
  },
];

const allSpecs = [...specs, ...comparisonHubs];

function publishAt(index) {
  const day = Math.floor(index / POSTS_PER_DAY);
  const slot = index % POSTS_PER_DAY;
  return new Date(START_DAY_UTC + day * 24 * 60 * 60 * 1000 + slot * 2 * 60 * 60 * 1000).toISOString();
}

function sourceLinks(spec) {
  if (spec.category === "Software Comparison") {
    return [
      { title: "Pest control software buying framework", url: "https://gorilladesk.com/industries/pest-control-software/", source: "GorillaDesk" },
      { title: "Pest control CRM feature overview", url: "https://www.pestpac.com/features/pest-control-crm-software", source: "PestPac" },
    ];
  }
  if (spec.category === "Compliance Software") {
    return [{ title: "Pesticide worker safety resources", url: "https://www.epa.gov/pesticide-worker-safety", source: "U.S. Environmental Protection Agency" }];
  }
  return [{ title: "Pest control software operations overview", url: "https://gorilladesk.com/industries/pest-control-software/", source: "GorillaDesk" }];
}

function internalLinks(spec) {
  const second = spec.category === "Software Comparison"
    ? { label: "Compare pest control software", href: "/blog/best-pest-control-software-for-small-business" }
    : spec.category === "Billing Software"
      ? { label: "Compare pest control invoicing software", href: "/blog/pest-control-invoicing-software" }
      : spec.category === "CRM Software"
        ? { label: "Compare pest control CRMs", href: "/blog/best-pest-control-crm" }
        : { label: "Read the PestFlow software guide", href: "/blog/best-pest-control-software-for-small-business" };
  return [{ label: "Start a PestFlow trial", href: "/onboarding" }, second];
}

function buildPost(spec, index) {
  const subject = spec.keyword;
  const req = spec.requirements;
  const risk = spec.risks;
  const migration = spec.migration;
  const price = spec.pricing;
  const sections = [
    { type: "paragraph", text: `${spec.title} is an owner decision, not a search for the longest feature list. The practical goal is to ${spec.purpose}. A strong evaluation starts with the actual company: technician count, recurring-service model, commercial requirements, payment rules, office staffing, current systems, and the exceptions that consume management time.` },
    { type: "callout", title: "The owner test", items: req },
    { type: "heading", text: `What ${subject} must control` },
    { type: "paragraph", text: `Write the operating requirement before opening a demo. The system must prove ${req[0].toLowerCase()}, ${req[1].toLowerCase()}, ${req[2].toLowerCase()}, and ${req[3].toLowerCase()}. Ask the vendor to show each result from a blank or representative account. A prepared dashboard can show what a product looks like, but it does not prove how the company will handle daily work, corrections, ownership, and follow-through.` },
    { type: "table", headers: ["Evaluation area", "Evidence to request", "Owner decision"], rows: req.map((item, itemIndex) => [item, `Show the complete workflow and resulting record for ${item.toLowerCase()}`, `Confirm owner, exception, and downstream action ${itemIndex + 1}`]) },
    { type: "heading", text: "Run one comparable live-workflow trial" },
    { type: "paragraph", text: `Do not let each vendor choose a different success story. The trial should ${spec.trial}. Use representative data, including an awkward customer, an edit after completion, a failed step, and a manager correction. Record how many screens, exports, manual messages, and duplicate entries are required. The better result is the workflow the real team can repeat accurately, not the fastest polished demonstration.` },
    { type: "list", items: ["Use the same scenario in every serious product", "Test on the phones and computers the team actually uses", "Include an exception, correction, and failed step", "Trace every result to the customer and job record", "Export the final record before making a decision", "Write gaps and promised follow-up instead of relying on memory"] },
    { type: "heading", text: "Watch the risks that appear after the demo" },
    { type: "paragraph", text: `The most expensive weaknesses usually appear after configuration and adoption begin. Test specifically for ${risk[0].toLowerCase()}, ${risk[1].toLowerCase()}, ${risk[2].toLowerCase()}, and ${risk[3].toLowerCase()}. Ask who owns each exception, how the system exposes it, and whether the underlying history remains visible. If the answer depends on a private spreadsheet or one expert employee, the software has not become the operating source of truth.` },
    { type: "table", headers: ["Risk", "Live check", "Required control"], rows: risk.map((item) => [item, `Create a test case for ${item.toLowerCase()}`, "Visible owner, status, history, and recovery path"]) },
    { type: "heading", text: "Implementation and migration are part of the product" },
    { type: "paragraph", text: `A purchase is not complete when the contract is signed. The implementation plan should ${migration[0].toLowerCase()}, ${migration[1].toLowerCase()}, ${migration[2].toLowerCase()}, and ${migration[3].toLowerCase()}. Name the person responsible for each decision and the evidence that proves completion. Run a limited pilot, preserve the raw source export, and reconcile customers, future service, open money, and critical history before the old system is canceled.` },
    { type: "list", items: migration },
    { type: "heading", text: "Compare the complete cost, not the advertised number" },
    { type: "paragraph", text: `Request a written quote that covers ${price[0].toLowerCase()}, ${price[1].toLowerCase()}, ${price[2].toLowerCase()}, and ${price[3].toLowerCase()}. Model the company at today's size and at the expected team size twelve months from now. Add internal setup, training, cleanup, overlap, and reconciliation time. Then compare that cost with specific savings or revenue protection that can be measured after launch. Do not count vague growth promises as return on investment.` },
    { type: "table", headers: ["Cost area", "Question for the vendor", "Owner calculation"], rows: price.map((item) => [item, `What is included, limited, or billed separately for ${item.toLowerCase()}?`, "Monthly, one-time, and growth-stage cost"]) },
    { type: "heading", text: "How PestFlow should fit the decision" },
    { type: "paragraph", text: `PestFlow is built around the operating connection between customers, recurring work, route visibility, technician execution, billing, communication, and owner follow-through. For ${subject}, require PestFlow to pass the same scenario and evidence standard as every alternative. The product should reduce handoffs and make exceptions visible. If a required workflow is incomplete, document the gap rather than assuming a roadmap promise will solve it.` },
    { type: "heading", text: "The decision rule" },
    { type: "paragraph", text: `Choose the system that handles the representative workflow with the fewest uncontrolled handoffs, preserves the history the company needs, gives each exception an owner, and produces results managers can verify. The right ${subject} should make the next operating decision easier and more reliable. If the team must still reconstruct the truth from texts, spreadsheets, or several dashboards, keep evaluating before committing the customer base and recurring revenue.` },
  ];

  return {
    slug: spec.slug,
    title: spec.title,
    description: `Owner-focused guide to ${spec.keyword}, including workflow tests, migration, pricing, risks, and a practical buying scorecard.`.slice(0, 155),
    keyword: spec.keyword,
    secondaryKeywords: spec.secondaryKeywords,
    readTime: "7 min read",
    category: spec.category,
    updated: "July 2026",
    excerpt: `A field-aware buying guide for pest control owners evaluating ${spec.keyword}, with real workflow tests, implementation checks, and complete-cost questions.`,
    author: AUTHOR,
    publishedAt: publishAt(index),
    sourceLinks: sourceLinks(spec),
    internalLinks: internalLinks(spec),
    sections,
  };
}

function articleWordCount(post) {
  return post.sections.flatMap((section) => {
    if (section.type === "table") return [...section.headers, ...section.rows.flat()];
    if (section.type === "list" || section.type === "callout") return [section.title || "", ...(section.items || [])];
    return [section.text || ""];
  }).join(" ").split(/\s+/).filter(Boolean).length;
}

function articleShingles(post, size = 5) {
  const words = post.sections.flatMap((section) => {
    if (section.type === "table") return [...section.headers, ...section.rows.flat()];
    if (section.type === "list" || section.type === "callout") return [section.title || "", ...(section.items || [])];
    return [section.text || ""];
  }).join(" ").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const shingles = new Set();
  for (let index = 0; index <= words.length - size; index += 1) {
    shingles.add(words.slice(index, index + size).join(" "));
  }
  return shingles;
}

const existing = (await Promise.all(EXISTING_PATHS.map(async (path) => JSON.parse(await readFile(path, "utf8"))))).flat();
const existingSlugs = new Set(existing.map((post) => post.slug));
const selectedSpecs = allSpecs.filter((spec) => !existingSlugs.has(spec.slug));
const posts = selectedSpecs.map(buildPost);
const allSlugs = [...existing.map((post) => post.slug), ...posts.map((post) => post.slug)];
const duplicateSlugs = allSlugs.filter((slug, index) => allSlugs.indexOf(slug) !== index);

if (duplicateSlugs.length > 0) throw new Error(`Duplicate slugs: ${[...new Set(duplicateSlugs)].join(", ")}`);
for (const post of posts) {
  const words = articleWordCount(post);
  if (words < 600) throw new Error(`${post.slug} has only ${words} words`);
  if (/[—–]/.test(JSON.stringify(post))) throw new Error(`${post.slug} contains a prohibited dash`);
}

const keywordFile = JSON.parse(await readFile(KEYWORDS_PATH, "utf8"));
const keywordBank = keywordFile.clusters.flatMap((cluster) => cluster.keywords);
const mappedKeywords = new Set(
  [...existing, ...posts]
    .flatMap((post) => [post.keyword, ...(post.secondaryKeywords || [])])
    .map((keyword) => keyword.toLowerCase()),
);
const unmappedKeywords = keywordBank.filter((keyword) => !mappedKeywords.has(keyword.toLowerCase()));
if (unmappedKeywords.length > 0) throw new Error(`Unmapped keyword research: ${unmappedKeywords.join(", ")}`);

const shingleSets = posts.map((post) => articleShingles(post));
for (let left = 0; left < posts.length; left += 1) {
  for (let right = left + 1; right < posts.length; right += 1) {
    let intersection = 0;
    for (const shingle of shingleSets[left]) if (shingleSets[right].has(shingle)) intersection += 1;
    const similarity = intersection / (shingleSets[left].size + shingleSets[right].size - intersection);
    if (similarity > 0.65) {
      throw new Error(`Near-duplicate articles: ${posts[left].slug} and ${posts[right].slug} (${similarity.toFixed(3)})`);
    }
  }
}

const postsByCentralDay = new Map();
for (const post of posts) {
  const centralDay = new Date(Date.parse(post.publishedAt) - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  postsByCentralDay.set(centralDay, (postsByCentralDay.get(centralDay) || 0) + 1);
}
for (const [day, count] of postsByCentralDay) {
  if (count > POSTS_PER_DAY) throw new Error(`${day} schedules ${count} posts; maximum is ${POSTS_PER_DAY}`);
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Wrote ${posts.length} prewritten posts to ${OUTPUT_PATH}`);
console.log(`Schedule: ${posts[0]?.publishedAt || "none"} through ${posts.at(-1)?.publishedAt || "none"}`);
console.log(`Word range: ${Math.min(...posts.map(articleWordCount))}-${Math.max(...posts.map(articleWordCount))}`);
console.log(`Keyword coverage: ${keywordBank.length}/${keywordBank.length}; maximum ${POSTS_PER_DAY} posts per Central day`);
