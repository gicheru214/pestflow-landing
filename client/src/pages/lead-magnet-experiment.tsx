import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Globe2,
  MapPin,
  MessageSquareText,
  PhoneCall,
  Radar,
  RefreshCcw,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analytics } from "@/lib/analytics";
import {
  getLeadMagnet,
  isLeadMagnetId,
  US_STATES,
  type LeadMagnetConfig,
  type LeadMagnetId,
} from "@/lead-magnets/config";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

const CALENDLY_URL = "https://calendly.com/tgicheru21/pestflow-set-up-call";

type Stage = "qualifier" | "contact" | "result";
type Answers = Record<string, string>;

interface ContactFields {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  routes: string;
  technicians: string;
}

const INITIAL_CONTACT: ContactFields = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  routes: "",
  technicians: "",
};

const SELECT_CLASS = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15";

function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") };
}

function readCampaign() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "direct",
    utmCampaign: params.get("utm_campaign") || "",
    utmContent: params.get("utm_content") || "",
    assignment: params.get("lm_assignment") || "direct",
  };
}

function requiredQualifierFields(id: LeadMagnetId): string[] {
  switch (id) {
    case "local-growth-map": return ["businessName", "city", "state"];
    case "ai-receptionist": return ["businessName", "callScenario"];
    case "competitor-exit": return ["currentSystem", "routeCount", "switchTiming"];
    case "state-compliance": return ["state", "serviceMix", "technicianCount"];
    case "bid-radar": return ["state", "serviceArea", "commercialExperience"];
  }
}

function qualifierIsComplete(id: LeadMagnetId, answers: Answers) {
  return requiredQualifierFields(id).every((field) => answers[field]?.trim());
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-bold text-slate-600">{children}</label>;
}

function QualifierFields({ id, answers, setAnswer }: { id: LeadMagnetId; answers: Answers; setAnswer: (key: string, value: string) => void }) {
  if (id === "local-growth-map") {
    return (
      <>
        <div>
          <FieldLabel>Business name</FieldLabel>
          <Input value={answers.businessName || ""} onChange={(event) => setAnswer("businessName", event.target.value)} placeholder="Smith Pest Control" className="h-11 rounded-xl" />
        </div>
        <div>
          <FieldLabel>Website <span className="font-medium text-slate-400">(optional)</span></FieldLabel>
          <Input value={answers.website || ""} onChange={(event) => setAnswer("website", event.target.value)} placeholder="smithpest.com" className="h-11 rounded-xl" />
        </div>
        <div className="grid grid-cols-[1fr_.9fr] gap-3">
          <div>
            <FieldLabel>Primary city</FieldLabel>
            <Input value={answers.city || ""} onChange={(event) => setAnswer("city", event.target.value)} placeholder="Austin" className="h-11 rounded-xl" />
          </div>
          <div>
            <FieldLabel>State</FieldLabel>
            <select value={answers.state || ""} onChange={(event) => setAnswer("state", event.target.value)} className={SELECT_CLASS}>
              <option value="">Select</option>
              {US_STATES.map((state) => <option key={state}>{state}</option>)}
            </select>
          </div>
        </div>
      </>
    );
  }

  if (id === "ai-receptionist") {
    return (
      <>
        <div>
          <FieldLabel>Business name</FieldLabel>
          <Input value={answers.businessName || ""} onChange={(event) => setAnswer("businessName", event.target.value)} placeholder="Smith Pest Control" className="h-11 rounded-xl" />
        </div>
        <div>
          <FieldLabel>Which caller should test the receptionist?</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {["Termite inspection", "Rodent emergency", "Bed bug quote", "Recurring service question"].map((option) => (
              <button key={option} type="button" onClick={() => setAnswer("callScenario", option)} className={`rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${answers.callScenario === option ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{option}</button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>What should the receptionist try to do?</FieldLabel>
          <select value={answers.callOutcome || "Book an inspection"} onChange={(event) => setAnswer("callOutcome", event.target.value)} className={SELECT_CLASS}>
            <option>Book an inspection</option>
            <option>Collect lead details</option>
            <option>Explain the recurring plan</option>
            <option>Escalate an urgent call</option>
          </select>
        </div>
      </>
    );
  }

  if (id === "competitor-exit") {
    return (
      <>
        <div>
          <FieldLabel>What are you using today?</FieldLabel>
          <select value={answers.currentSystem || ""} onChange={(event) => setAnswer("currentSystem", event.target.value)} className={SELECT_CLASS}>
            <option value="">Choose current system</option>
            <option>FieldRoutes</option>
            <option>PestPac</option>
            <option>GorillaDesk</option>
            <option>Briostack</option>
            <option>Spreadsheets + QuickBooks</option>
            <option>Another system</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Active routes</FieldLabel>
            <select value={answers.routeCount || ""} onChange={(event) => setAnswer("routeCount", event.target.value)} className={SELECT_CLASS}>
              <option value="">Select</option><option>1</option><option>2–3</option><option>4–7</option><option>8–15</option><option>16+</option>
            </select>
          </div>
          <div>
            <FieldLabel>Switch timing</FieldLabel>
            <select value={answers.switchTiming || ""} onChange={(event) => setAnswer("switchTiming", event.target.value)} className={SELECT_CLASS}>
              <option value="">Select</option><option>Within 30 days</option><option>1–3 months</option><option>3–6 months</option><option>Researching</option>
            </select>
          </div>
        </div>
        <div>
          <FieldLabel>Biggest migration concern</FieldLabel>
          <select value={answers.migrationConcern || "Customer and recurring-service data"} onChange={(event) => setAnswer("migrationConcern", event.target.value)} className={SELECT_CLASS}>
            <option>Customer and recurring-service data</option><option>Stored payment methods</option><option>Training technicians</option><option>Reporting and history</option><option>Running two systems during cutover</option>
          </select>
        </div>
      </>
    );
  }

  if (id === "state-compliance") {
    return (
      <>
        <div>
          <FieldLabel>State</FieldLabel>
          <select value={answers.state || ""} onChange={(event) => setAnswer("state", event.target.value)} className={SELECT_CLASS}>
            <option value="">Select state</option>
            {US_STATES.map((state) => <option key={state}>{state}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Service mix</FieldLabel>
          <select value={answers.serviceMix || ""} onChange={(event) => setAnswer("serviceMix", event.target.value)} className={SELECT_CLASS}>
            <option value="">Select service mix</option><option>Residential recurring</option><option>Commercial</option><option>Residential + commercial</option><option>Termite / WDO</option><option>Wildlife + pest control</option>
          </select>
        </div>
        <div>
          <FieldLabel>Licensed technicians / applicators</FieldLabel>
          <select value={answers.technicianCount || ""} onChange={(event) => setAnswer("technicianCount", event.target.value)} className={SELECT_CLASS}>
            <option value="">Select</option><option>1</option><option>2–3</option><option>4–7</option><option>8–15</option><option>16+</option>
          </select>
        </div>
      </>
    );
  }

  return (
    <>
      <div>
        <FieldLabel>Primary state</FieldLabel>
        <select value={answers.state || ""} onChange={(event) => setAnswer("state", event.target.value)} className={SELECT_CLASS}>
          <option value="">Select state</option>
          {US_STATES.map((state) => <option key={state}>{state}</option>)}
        </select>
      </div>
      <div>
        <FieldLabel>Counties or service area</FieldLabel>
        <Input value={answers.serviceArea || ""} onChange={(event) => setAnswer("serviceArea", event.target.value)} placeholder="Travis, Williamson, Hays" className="h-11 rounded-xl" />
      </div>
      <div>
        <FieldLabel>Commercial experience</FieldLabel>
        <select value={answers.commercialExperience || ""} onChange={(event) => setAnswer("commercialExperience", event.target.value)} className={SELECT_CLASS}>
          <option value="">Select</option><option>Residential only today</option><option>Some commercial accounts</option><option>1–3 years commercial</option><option>4–10 years commercial</option><option>10+ years commercial</option>
        </select>
      </div>
    </>
  );
}

function LocalGrowthPreview() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-emerald-100 bg-[#f3fbf7] p-5 shadow-[0_28px_80px_rgba(19,85,61,.16)] sm:p-7">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(#9bd0bc 1px,transparent 1px),linear-gradient(90deg,#9bd0bc 1px,transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="relative">
        <div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-800">Example market output</p><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-emerald-700 shadow-sm">Sample only</span></div>
        <div className="relative mt-7 h-52 rounded-2xl border border-emerald-100 bg-white/80">
          {[{ x: "18%", y: "55%", label: "Core", tone: "bg-emerald-600" }, { x: "58%", y: "27%", label: "Gap #1", tone: "bg-amber-500" }, { x: "75%", y: "67%", label: "Gap #2", tone: "bg-amber-500" }, { x: "41%", y: "74%", label: "Gap #3", tone: "bg-amber-500" }].map((point) => <div key={point.label} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: point.x, top: point.y }}><span className={`mx-auto block h-4 w-4 rounded-full ${point.tone} ring-4 ring-white`} /><span className="mt-1 block rounded bg-white px-2 py-1 text-[9px] font-black text-slate-600 shadow-sm">{point.label}</span></div>)}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">{[["Review gap", "−37"], ["Nearby markets", "3"], ["Priority", "North"]].map(([label, value]) => <div key={label} className="rounded-xl border border-emerald-100 bg-white/90 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-lg font-black text-slate-800">{value}</p></div>)}</div>
      </div>
    </div>
  );
}

function AiCallPreview() {
  return (
    <div className="min-h-[360px] rounded-[28px] border border-violet-100 bg-[#151226] p-5 text-white shadow-[0_28px_80px_rgba(74,50,160,.25)] sm:p-7">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-full bg-violet-500"><PhoneCall className="h-5 w-5" /></span><div><p className="text-sm font-black">Incoming lead</p><p className="text-[10px] text-white/40">Termite inspection · 00:42</p></div></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black text-emerald-300">AI answering</span></div>
      <div className="mt-6 flex h-14 items-center justify-center gap-1">{[12,24,34,18,42,52,26,16,38,46,22,30,12,40,20,14,32].map((height, index) => <span key={index} className="w-1.5 rounded-full bg-violet-400" style={{ height }} />)}</div>
      <div className="mt-6 space-y-3">
        <div className="mr-10 rounded-2xl rounded-tl-sm bg-white/8 p-3 text-xs leading-5 text-white/70">Thanks for calling Smith Pest Control. Are you seeing active termites, or would you like to schedule an inspection?</div>
        <div className="ml-10 rounded-2xl rounded-tr-sm bg-violet-500 p-3 text-xs leading-5">I found mud tubes near the garage and want someone to look tomorrow.</div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">{[["Intent", "Inspection"], ["Urgency", "High"], ["Next step", "Book"]].map(([label, value]) => <div key={label}><p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p><p className="mt-1 text-xs font-black">{value}</p></div>)}</div>
    </div>
  );
}

function ExitPreview() {
  return (
    <div className="min-h-[360px] rounded-[28px] border border-blue-100 bg-[#f4f8fd] p-5 shadow-[0_28px_80px_rgba(32,83,142,.17)] sm:p-7">
      <div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[.16em] text-blue-800">Example switch plan</p><RefreshCcw className="h-5 w-5 text-blue-500" /></div>
      <div className="mt-6 space-y-3">{[
        ["01", "Request", "Customers, locations, recurring schedules, balances, documents"],
        ["02", "Pilot", "Build one representative route without touching the old system"],
        ["03", "Validate", "Reconcile counts, dates, pricing, ownership, and exceptions"],
        ["04", "Decide", "Choose the cutover only after the sample workflow passes"],
      ].map(([number, title, copy], index) => <div key={number} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">{number}</span><div><p className="text-sm font-black text-slate-800">{title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{copy}</p></div>{index < 3 ? <ArrowRight className="h-4 w-4 text-blue-300" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}</div>)}
      </div>
    </div>
  );
}

function CompliancePreview() {
  return (
    <div className="min-h-[360px] rounded-[28px] border border-amber-100 bg-[#fffaf3] p-5 shadow-[0_28px_80px_rgba(133,82,18,.16)] sm:p-7">
      <div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-800">Example state pack</p><span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800">Not legal advice</span></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl bg-amber-600 p-5 text-white"><FileCheck2 className="h-8 w-8" /><p className="mt-14 text-xl font-black leading-tight">Pest Control Recordkeeping Pack</p><p className="mt-2 text-xs text-white/65">State-specific staging preview</p></div>
        <div className="rounded-2xl border border-amber-100 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Included sections</p>
          <div className="mt-4 space-y-3">{["Application and product record", "Customer copy and delivery", "Applicator and license roster", "Correction and audit history", "Official source checklist"].map((item) => <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="grid h-5 w-5 place-items-center rounded-full bg-amber-50 text-amber-700"><Check className="h-3 w-3" /></span>{item}</div>)}</div>
        </div>
      </div>
      <p className="mt-4 text-[10px] leading-4 text-slate-400">Production packs require a current official source, last-reviewed date, and state-by-state validation.</p>
    </div>
  );
}

function BidPreview() {
  return (
    <div className="min-h-[360px] rounded-[28px] border border-rose-100 bg-[#fff6f8] p-5 shadow-[0_28px_80px_rgba(151,42,70,.16)] sm:p-7">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Radar className="h-5 w-5 text-rose-600" /><p className="text-xs font-black uppercase tracking-[.16em] text-rose-800">Sample opportunity feed</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-rose-700">Staging data</span></div>
      <div className="mt-6 space-y-3">{[
        ["Independent school district", "Recurring IPM · 12 campuses", "Closes in 9 days"],
        ["Multifamily portfolio", "Quarterly service · 480 units", "Site walk available"],
        ["County facilities", "Pest + rodent monitoring", "Closes in 17 days"],
      ].map(([title, detail, timing], index) => <div key={title} className="rounded-2xl border border-rose-100 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div><span className="rounded-lg bg-rose-50 px-2 py-1 text-[9px] font-black text-rose-700">{index === 0 ? "Best fit" : "Review"}</span></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400"><Clock3 className="h-3.5 w-3.5" />{timing}</span><span className="text-[10px] font-black text-rose-700">View requirements →</span></div></div>)}
      </div>
    </div>
  );
}

function ProductPreview({ id }: { id: LeadMagnetId }) {
  if (id === "local-growth-map") return <LocalGrowthPreview />;
  if (id === "ai-receptionist") return <AiCallPreview />;
  if (id === "competitor-exit") return <ExitPreview />;
  if (id === "state-compliance") return <CompliancePreview />;
  return <BidPreview />;
}

function ResultDetails({ config, answers }: { config: LeadMagnetConfig; answers: Answers }) {
  if (config.id === "local-growth-map") {
    return <div className="grid gap-3 sm:grid-cols-3">{[["Review gap", "Sample: 37"], ["Nearby openings", "Sample: 3"], ["Next action", `Validate ${answers.city || "your market"}`]].map(([label, value]) => <ResultMetric key={label} label={label} value={value} />)}</div>;
  }
  if (config.id === "ai-receptionist") {
    return <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-950"><strong>Sample transcript:</strong> “I can help with that {answers.callScenario?.toLowerCase() || "pest-control request"}. What address needs service, and is there active pest activity right now?”</div>;
  }
  if (config.id === "competitor-exit") {
    return <div className="grid gap-2">{["Request a complete export from " + (answers.currentSystem || "the current system"), "Preserve the raw source before cleanup", "Build one representative route", "Validate counts and recurring dates before cutover"].map((item) => <ResultCheck key={item}>{item}</ResultCheck>)}</div>;
  }
  if (config.id === "state-compliance") {
    return <div className="grid gap-2">{[`${answers.state || "State"} official source index`, "Application and product record", "Customer-copy delivery log", "Applicator and correction history"].map((item) => <ResultCheck key={item}>{item}</ResultCheck>)}</div>;
  }
  return <div className="grid gap-3 sm:grid-cols-3">{[["Geography", answers.state || "Selected state"], ["Service area", answers.serviceArea || "Selected counties"], ["Delivery", "Weekly sample radar"]].map(([label, value]) => <ResultMetric key={label} label={label} value={value} />)}</div>;
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-sm font-black text-slate-800">{value}</p></div>;
}

function ResultCheck({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check className="h-3 w-3" /></span>{children}</div>;
}

function ContactForm({ config, contact, setContact, error, submitting, onSubmit, onBack }: { config: LeadMagnetConfig; contact: ContactFields; setContact: (key: keyof ContactFields, value: string) => void; error: string; submitting: boolean; onSubmit: () => void; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button type="button" onClick={onBack} className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700"><ChevronLeft className="h-3.5 w-3.5" />Change my answers</button>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900">Your report is configured. Add the contact information needed to save the request and deliver the result.</div>
      <div><FieldLabel>Full name</FieldLabel><Input value={contact.fullName} onChange={(event) => setContact("fullName", event.target.value)} placeholder="John Smith" className="h-11 rounded-xl" /></div>
      <div><FieldLabel>Company name</FieldLabel><Input value={contact.companyName} onChange={(event) => setContact("companyName", event.target.value)} placeholder="Smith Pest Control" className="h-11 rounded-xl" /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><FieldLabel>Work email</FieldLabel><Input value={contact.email} onChange={(event) => setContact("email", event.target.value)} type="email" placeholder="john@company.com" className="h-11 rounded-xl" /></div><div><FieldLabel>Mobile phone</FieldLabel><Input value={contact.phone} onChange={(event) => setContact("phone", event.target.value)} type="tel" placeholder="(555) 123-4567" className="h-11 rounded-xl" /></div></div>
      <div className="grid gap-3 sm:grid-cols-2"><div><FieldLabel>Active routes</FieldLabel><select value={contact.routes} onChange={(event) => setContact("routes", event.target.value)} className={SELECT_CLASS}><option value="">Select</option><option>0 / pre-launch</option><option>1</option><option>2–3</option><option>4–7</option><option>8–15</option><option>16+</option></select></div><div><FieldLabel>Field technicians</FieldLabel><select value={contact.technicians} onChange={(event) => setContact("technicians", event.target.value)} className={SELECT_CLASS}><option value="">Select</option><option>Just me</option><option>2–3</option><option>4–7</option><option>8–15</option><option>16+</option></select></div></div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      <Button disabled={submitting} onClick={onSubmit} className="h-12 w-full rounded-xl text-sm font-black text-white" style={{ background: config.accent }}>{submitting ? "Saving your request…" : `Get my ${config.shortName}`}<ArrowRight className="ml-2 h-4 w-4" /></Button>
      <p className="text-center text-[10px] leading-4 text-slate-400">By submitting, you agree PestFlow may contact you about this request. Testing links can use <strong>?internal=1</strong> to avoid analytics.</p>
    </div>
  );
}

export default function LeadMagnetExperiment({ variant }: { variant: string }) {
  const config = useMemo(() => getLeadMagnet(variant), [variant]);
  const [stage, setStage] = useState<Stage>("qualifier");
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContactState] = useState<ContactFields>(INITIAL_CONTACT);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!config) return;
    document.title = `${config.shortName} | PestFlow Staging`;
    analytics.pageView("Lead Magnet Experiment", { variant: config.id, ...readCampaign() });
    analytics.track("Lead Magnet Viewed", { variant: config.id, ...readCampaign() });
  }, [config]);

  if (!config || !isLeadMagnetId(variant)) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-white/35">Unknown experiment</p><h1 className="mt-4 text-4xl font-black">That lead-magnet variant does not exist.</h1><Link href="/experiments/lead-magnets" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900">Open experiment lab</Link></div></main>;
  }

  const setAnswer = (key: string, value: string) => { setAnswers((current) => ({ ...current, [key]: value })); setError(""); };
  const setContact = (key: keyof ContactFields, value: string) => { setContactState((current) => ({ ...current, [key]: value })); setError(""); };

  const continueToContact = () => {
    if (!qualifierIsComplete(config.id, answers)) { setError("Complete the required fields so we can configure this result."); return; }
    setContactState((current) => ({ ...current, companyName: current.companyName || answers.businessName || "", routes: current.routes || answers.routeCount || "", technicians: current.technicians || answers.technicianCount || "" }));
    setStage("contact");
    analytics.track("Lead Magnet Qualified", { variant: config.id, ...readCampaign() });
  };

  const submitLead = async () => {
    const { firstName, lastName } = splitFullName(contact.fullName);
    if (!firstName || !lastName) { setError("Enter a real first and last name."); return; }
    if (!contact.companyName.trim()) { setError("Enter your pest control company name."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) { setError("Enter a valid work email."); return; }
    if (contact.phone.replace(/\D/g, "").length < 10) { setError("Enter a valid phone number."); return; }
    if (!contact.routes || !contact.technicians) { setError("Select your active routes and field team size."); return; }

    setSubmitting(true);
    setError("");
    const campaign = readCampaign();
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lead_magnet",
          firstName,
          lastName,
          email: contact.email.trim().toLowerCase(),
          phone: contact.phone.trim(),
          companyName: contact.companyName.trim(),
          website: answers.website || null,
          technicians: contact.technicians,
          routes: contact.routes,
          city: answers.city || null,
          state: answers.state || null,
          routeAnswers: {
            leadMagnet: config.id,
            answers,
            campaign,
            referrer: document.referrer || null,
            stagingPrototype: true,
          },
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "We could not save your request.");
      }
      sessionStorage.setItem("pestflow_popup_data", JSON.stringify({ name: contact.fullName, firstName, lastName, email: contact.email.trim().toLowerCase(), phone: contact.phone.trim(), routeSize: contact.routes, leadMagnet: config.id }));
      analytics.identify(contact.email.trim().toLowerCase(), { lead_magnet: config.id });
      analytics.track("Lead Magnet Submitted", { variant: config.id, routes: contact.routes, technicians: contact.technicians, ...campaign });
      setStage("result");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your request.");
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    analytics.track("Lead Magnet CTA Clicked", { variant: config.id, ...readCampaign() });
  };

  return (
    <div className="min-h-screen bg-[#fbfcfa] text-slate-900">
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-3"><img src={logoImage} alt="PestFlow" className="h-12 w-auto" /><div className="hidden sm:block"><p className="text-sm font-black tracking-tight">PestFlow</p><p className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-400">Owner tools</p></div></a>
          <div className="flex items-center gap-3"><a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="hidden text-xs font-bold text-slate-500 hover:text-slate-900 sm:block">Book setup</a><Button onClick={openForm} className="h-10 rounded-full px-5 text-xs font-black text-white" style={{ background: config.accent }}>{config.primaryCta}</Button></div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1fr_.95fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-[10px] font-black uppercase tracking-[.15em] shadow-sm" style={{ borderColor: `${config.accent}33`, color: config.accent }}><span className="h-2 w-2 rounded-full" style={{ background: config.accent }} />{config.eyebrow}</div>
            <h1 className="mt-7 text-[clamp(3.1rem,7vw,6.4rem)] font-black leading-[.92] tracking-[-.055em]">{config.headline}<br /><span style={{ color: config.accent }}>{config.highlight}</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-500 sm:text-lg">{config.body}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={openForm} className="h-14 rounded-full px-7 text-sm font-black text-white shadow-lg" style={{ background: config.accent }}>{config.primaryCta}<ArrowRight className="ml-2 h-4 w-4" /></Button><a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-sm font-black text-slate-600 shadow-sm"><CalendarDays className="mr-2 h-4 w-4" />Book a 15-minute setup</a></div>
            <div className="mt-10 flex flex-wrap gap-8 border-t border-slate-200 pt-6">{config.proof.map((item) => <div key={item.label}><p className="text-xl font-black tracking-tight">{item.value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p></div>)}</div>
          </div>
          <ProductPreview id={config.id} />
        </section>

        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div><p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: config.accent }}>What the owner receives</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">Useful enough to act on. Specific enough to qualify.</h2><p className="mt-5 text-sm leading-7 text-slate-500">{config.qualifier}</p></div>
            <div className="grid gap-4 sm:grid-cols-3">{config.benefits.map((benefit, index) => <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-[#fbfcfa] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl text-xs font-black" style={{ background: config.accentSoft, color: config.accent }}>0{index + 1}</span><h3 className="mt-5 text-base font-black">{benefit.title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{benefit.body}</p></div>)}</div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em]" style={{ color: config.accent }}>One short capture flow</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">No long quiz between the visitor and the result.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-500">The first screen asks only what is necessary to configure this specific magnet. The second captures complete contact information and two business-activity signals.</p>
            <div className="mt-7 space-y-3">{["Full name, work email, and real phone", "Active routes and field-team size", "UTM source, campaign, content, and assigned variant", "Result handoff into the PestFlow signup path"].map((item) => <div key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-600"><span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full" style={{ background: config.accentSoft, color: config.accent }}><Check className="h-3 w-3" /></span>{item}</div>)}</div>
            <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Staging boundary:</strong> {config.integrationNote}</div>
          </div>

          <div ref={formRef} className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,.12)] sm:p-7">
            {stage === "qualifier" && <><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.15em]" style={{ color: config.accent }}>Step 1 of 2</p><h3 className="mt-2 text-2xl font-black">Configure your {config.shortName}</h3></div><config.icon className="h-7 w-7" style={{ color: config.accent }} /></div><div className="mt-6 space-y-4"><QualifierFields id={config.id} answers={answers} setAnswer={setAnswer} />{error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}<Button onClick={continueToContact} className="h-12 w-full rounded-xl text-sm font-black text-white" style={{ background: config.accent }}>Continue to my result<ArrowRight className="ml-2 h-4 w-4" /></Button></div></>}
            {stage === "contact" && <ContactForm config={config} contact={contact} setContact={setContact} error={error} submitting={submitting} onSubmit={submitLead} onBack={() => { setStage("qualifier"); setError(""); }} />}
            {stage === "result" && <div><span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: config.accent }}><CheckCircle2 className="h-6 w-6" /></span><p className="mt-5 text-[10px] font-black uppercase tracking-[.15em]" style={{ color: config.accent }}>Lead saved · staging result</p><h3 className="mt-2 text-2xl font-black">{config.resultTitle}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{config.resultBody}</p><div className="mt-6"><ResultDetails config={config} answers={answers} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={`/signup-success?source=lead_magnet_${config.id}`} onClick={() => analytics.track("Lead Magnet Product CTA Clicked", { variant: config.id })} className="flex h-12 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: config.accent }}>Continue into PestFlow<ArrowRight className="ml-2 h-4 w-4" /></a><a href={CALENDLY_URL} target="_blank" rel="noreferrer" onClick={() => analytics.track("Lead Magnet Calendar Clicked", { variant: config.id })} className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600"><CalendarDays className="mr-2 h-4 w-4" />Book setup</a></div></div>}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8"><config.icon className="mx-auto h-9 w-9" style={{ color: config.accent }} /><p className="mt-5 text-xs font-black uppercase tracking-[.2em]" style={{ color: config.accent }}>{config.experimentLabel} · PestFlow lead-magnet test</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">Give the visitor a result worth remembering.</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/45">Each experiment has its own shareable URL, its own attribution value, and the same lead-capture contract so downstream comparisons stay clean.</p><Button onClick={openForm} className="mt-8 h-14 rounded-full px-8 text-sm font-black text-white" style={{ background: config.accent }}>{config.primaryCta}<ArrowUpRight className="ml-2 h-4 w-4" /></Button></div>
        </section>
      </main>
    </div>
  );
}
