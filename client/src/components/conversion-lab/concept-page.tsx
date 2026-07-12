import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  MapPinned,
  MessageSquareText,
  Route,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";
import type { LandingConcept } from "./concepts";

type ModalStep = "question" | "recommendation" | "calendar";
const AUTO_POPUP_KEY = "pestflow_conversion_lab_popup_seen";

function ProductPreview({ concept }: { concept: LandingConcept }) {
  const isCommerce = concept.mode === "commerce";
  const isDiagnostic = concept.mode === "diagnostic";

  return (
    <div className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[28px] border border-black/10 bg-[#101713] p-3 shadow-[0_36px_90px_rgba(20,35,26,0.22)]">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wide">
          <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: concept.accent }}>
            <Route className="h-4 w-4" />
          </span>
          PestFlow operating preview
        </div>
        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">LIVE SAMPLE</span>
      </div>

      {isCommerce ? (
        <div className="mt-3 grid gap-3 md:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-2xl bg-white p-5 text-slate-900">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Your seven-day proof plan</p>
            <p className="mt-4 text-4xl font-black tracking-tight" style={{ color: concept.accent }}>$1 today</p>
            <p className="mt-1 text-sm text-slate-500">Full product access. Renewal shown before checkout.</p>
            <div className="mt-5 space-y-2.5">
              {["Create tomorrow's route", "Send a test invoice", "Invite one teammate"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold">
                  <span className="grid h-6 w-6 place-items-center rounded-full text-xs text-white" style={{ background: concept.accent }}>{index + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
              <CreditCard className="h-5 w-5 text-emerald-300" />
              <p className="mt-4 text-sm font-bold">Billing, in plain language</p>
              <p className="mt-1 text-xs leading-5 text-white/55">Today, renewal day, plan price, and cancellation path appear together.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="mt-4 text-sm font-bold">Your data stays exportable</p>
              <p className="mt-1 text-xs leading-5 text-white/55">A trust promise tied to an actual product action.</p>
            </div>
          </div>
        </div>
      ) : isDiagnostic ? (
        <div className="mt-3 rounded-2xl bg-white p-5 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Operator score</p>
              <p className="mt-1 text-lg font-black">Where should PestFlow start?</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-full border-[7px] text-xl font-black" style={{ borderColor: concept.accentSoft, color: concept.accent }}>72</div>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["Route density", 62],
              ["Cash collection", 78],
              ["Field visibility", 44],
            ].map(([label, score]) => (
              <div key={String(label)}>
                <div className="mb-1.5 flex justify-between text-xs font-semibold"><span>{label}</span><span>{score}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${score}%`, background: concept.accent }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl p-4" style={{ background: concept.accentSoft }}>
            <p className="text-xs font-bold" style={{ color: concept.accent }}>FIRST WORKFLOW TO TEST</p>
            <p className="mt-1 text-sm font-semibold">Technician status, documentation, and office handoff</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-2xl bg-[#f7f9f7] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Tuesday route board</p>
                <p className="text-[11px] text-slate-500">5 technicians · 42 recurring stops</p>
              </div>
              <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm">8:14 AM</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["North", "Central", "South"].map((routeName, routeIndex) => (
                <div key={routeName} className="rounded-xl border border-slate-200 bg-white p-2">
                  <p className="mb-2 text-[10px] font-bold text-slate-500">{routeName}</p>
                  {[0, 1, 2].map((stop) => (
                    <div key={stop} className="mb-1.5 rounded-lg border border-slate-100 px-2 py-2 last:mb-0">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: routeIndex === 1 && stop === 1 ? "#f59e0b" : concept.accent }} />
                        <span className="truncate text-[9px] font-semibold text-slate-700">{["Quarterly", "Initial", "Commercial"][stop]}</span>
                      </div>
                      <p className="mt-1 text-[8px] text-slate-400">{8 + stop * 2}:30 · {18 + stop * 7} min</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Needs attention</p>
              <p className="mt-2 text-3xl font-black">3</p>
              <p className="mt-1 text-xs text-white/55">route gaps before noon</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Ready to collect</p>
              <p className="mt-2 text-2xl font-black">$4,860</p>
              <p className="mt-1 text-xs text-white/55">completed service today</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConciergeModal({ concept, onClose }: { concept: LandingConcept; onClose: () => void }) {
  const [step, setStep] = useState<ModalStep>("question");
  const [selection, setSelection] = useState("");
  const [email, setEmail] = useState("");

  const recommendation = useMemo(() => {
    const lower = selection.toLowerCase();
    if (lower.includes("route") || lower.includes("truck") || lower.includes("capacity")) return "Route board and recurring-service planning";
    if (lower.includes("billing") || lower.includes("payment") || lower.includes("charged")) return "Recurring billing and payment follow-up";
    if (lower.includes("field") || lower.includes("tech")) return "Technician visibility and service documentation";
    if (lower.includes("switch") || lower.includes("system") || lower.includes("export")) return "Parallel migration and data-control plan";
    return concept.productTitle;
  }, [selection, concept.productTitle]);

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-[#08100b]/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={concept.popup.headline}>
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-[#111713] text-white shadow-[0_40px_110px_rgba(0,0,0,.45)]">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white" aria-label="Close preview">
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: concept.accent }}><Sparkles className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{concept.popup.kicker}</p>
              <p className="mt-0.5 text-xs text-white/55">PestFlow guided preview · no submission in this lab</p>
            </div>
          </div>

          {step === "question" && (
            <>
              <h2 className="max-w-md text-2xl font-black leading-tight sm:text-3xl">{concept.popup.headline}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/58">{concept.popup.body}</p>
              <p className="mb-3 mt-7 text-xs font-bold uppercase tracking-[0.15em] text-white/35">{concept.popup.prompt}</p>
              <div className="grid gap-2.5">
                {concept.popup.options.map((option) => (
                  <button key={option} onClick={() => setSelection(option)} className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selection === option ? "border-white/35 bg-white/12" : "border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.07]"}`}>
                    <span>{option}</span>
                    <span className={`grid h-5 w-5 place-items-center rounded-full border ${selection === option ? "border-transparent text-white" : "border-white/20 text-transparent"}`} style={selection === option ? { background: concept.accent } : undefined}><Check className="h-3 w-3" /></span>
                  </button>
                ))}
              </div>
              <button disabled={!selection} onClick={() => setStep("recommendation")} className="mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-35" style={{ background: concept.accent }}>
                {concept.popup.cta}<ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button onClick={() => setStep("calendar")} className="mt-3 w-full text-center text-xs font-semibold text-white/45 underline-offset-4 hover:text-white hover:underline">{concept.popup.secondary}</button>
            </>
          )}

          {step === "recommendation" && (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: concept.accent }}>Recommended first workflow</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">{recommendation}</h2>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                <div className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${concept.accent}33`, color: concept.accent }}><Route className="h-5 w-5" /></span>
                  <div>
                    <p className="text-sm font-bold">See the relevant screen before signup</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">Then choose a $1 seven-day product test or a short guided setup. The phone field stays optional and explains why it is requested.</p>
                  </div>
                </div>
              </div>
              <label className="mt-6 block text-xs font-bold text-white/55">Email for the personalized setup link</label>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@yourcompany.com" className="mt-2 h-12 w-full rounded-xl border border-white/12 bg-white/[0.055] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30" />
              <p className="mt-2 text-[11px] leading-4 text-white/32">No phone required. If you request setup help, we will ask for the best callback number and explain why.</p>
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                <button disabled={!email.includes("@") || !email.includes(".")} className="flex h-12 items-center justify-center rounded-xl text-sm font-bold text-white disabled:opacity-35" style={{ background: concept.accent }}>Start my $1 test</button>
                <button onClick={() => setStep("calendar")} className="flex h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-sm font-bold text-white">Book setup instead</button>
              </div>
            </>
          )}

          {step === "calendar" && (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: concept.accent }}>Immediate scheduling</p>
              <h2 className="mt-3 text-2xl font-black leading-tight">Choose a short setup map</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">This simulates the qualified calendar shown after a visitor raises their hand, not a giant calendar dropped above product proof.</p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "Tomorrow"].map((slot) => (
                  <button key={slot} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-3 text-xs font-bold text-white/70 hover:border-white/30 hover:text-white">{slot}</button>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/45"><Clock3 className="h-4 w-4" />15 minutes · Your workflow · No generic deck</div>
              <button onClick={() => setStep("question")} className="mt-5 w-full text-center text-xs font-semibold text-white/40 hover:text-white">Back to the product router</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConceptPage({ concept }: { concept: LandingConcept }) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasOpenedModal = useRef(false);

  const openModal = () => {
    hasOpenedModal.current = true;
    window.sessionStorage.setItem(AUTO_POPUP_KEY, "true");
    setModalOpen(true);
  };
  const scrollToCalendar = () => document.getElementById("lab-calendar")?.scrollIntoView({ behavior: "smooth" });
  const scrollToProof = () => document.getElementById("lab-product-proof")?.scrollIntoView({ behavior: "smooth" });
  const handleSecondaryCta = () => {
    hasOpenedModal.current = true;
    window.sessionStorage.setItem(AUTO_POPUP_KEY, "true");
    if (concept.secondaryCta.toLowerCase().startsWith("book")) scrollToCalendar();
    else scrollToProof();
  };

  useEffect(() => {
    if (concept.id !== "guided-concierge" || window.sessionStorage.getItem(AUTO_POPUP_KEY)) return;
    const timer = window.setTimeout(() => {
      if (!hasOpenedModal.current) {
        hasOpenedModal.current = true;
        window.sessionStorage.setItem(AUTO_POPUP_KEY, "true");
        setModalOpen(true);
      }
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [concept.id]);

  return (
    <div style={{ background: concept.surface, color: concept.ink }} className="min-h-screen overflow-hidden">
      {modalOpen && <ConciergeModal concept={concept} onClose={() => setModalOpen(false)} />}
      <nav className="relative z-20 border-b border-black/[0.07] bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl text-white shadow-sm" style={{ background: concept.accent }}><Route className="h-5 w-5" /></span>
            <div><p className="text-sm font-black tracking-tight">PestFlow</p><p className="text-[10px] uppercase tracking-[0.17em] text-black/38">Conversion concept</p></div>
          </div>
          <div className="hidden items-center gap-7 text-xs font-semibold text-black/48 md:flex"><span>Product</span><span>How the test works</span><span>Pricing</span><button onClick={scrollToCalendar}>Book setup</button></div>
          <button onClick={openModal} className="h-10 rounded-full px-5 text-xs font-bold text-white shadow-sm" style={{ background: concept.accent }}>{concept.primaryCta}</button>
        </div>
      </nav>

      <main>
        <section className={`relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-12 sm:px-8 md:pt-16 ${concept.mode === "centered" || concept.mode === "diagnostic" ? "text-center" : "lg:grid-cols-[1fr_1.05fr] lg:items-center"}`}>
          <div className={concept.mode === "centered" || concept.mode === "diagnostic" ? "mx-auto max-w-4xl" : "max-w-2xl"}>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] shadow-sm"><span className="h-2 w-2 rounded-full" style={{ background: concept.accent }} />{concept.eyebrow}</div>
            <h1 className="text-[clamp(3rem,7vw,6.5rem)] font-black leading-[0.92] tracking-[-0.055em]">{concept.headline}<br />{" "}<span style={{ color: concept.accent }}>{concept.highlight}</span></h1>
            <p className={`mt-7 text-base leading-7 text-black/55 sm:text-lg sm:leading-8 ${concept.mode === "centered" || concept.mode === "diagnostic" ? "mx-auto max-w-2xl" : "max-w-xl"}`}>{concept.body}</p>
            <div className={`mt-9 flex flex-col gap-3 sm:flex-row ${concept.mode === "centered" || concept.mode === "diagnostic" ? "justify-center" : ""}`}>
              <button onClick={openModal} className="group flex h-14 items-center justify-center rounded-full px-7 text-sm font-bold text-white shadow-[0_16px_36px_rgba(20,40,25,.16)]" style={{ background: concept.accent }}>{concept.primaryCta}<ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" /></button>
              <button onClick={handleSecondaryCta} className="flex h-14 items-center justify-center rounded-full border border-black/10 bg-white/75 px-7 text-sm font-bold text-black/65 shadow-sm">{concept.secondaryCta}</button>
            </div>
            <p className="mt-5 text-xs font-medium text-black/38">{concept.trustLine}</p>
            <div className={`mt-10 flex flex-wrap gap-8 border-t border-black/[0.08] pt-6 ${concept.mode === "centered" || concept.mode === "diagnostic" ? "justify-center" : ""}`}>
              {concept.proof.map((item) => <div key={item.label}><p className="text-xl font-black tracking-tight">{item.value}</p><p className="mt-1 text-[11px] font-medium text-black/38">{item.label}</p></div>)}
            </div>
          </div>
          <div className={concept.mode === "centered" || concept.mode === "diagnostic" ? "mx-auto mt-3 w-full max-w-5xl" : ""}><ProductPreview concept={concept} /></div>
        </section>

        <section className="border-y border-black/[0.07] bg-white/65">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: concept.accent }}>Why this concept can convert</p>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{concept.storyTitle}</h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-black/50">{concept.storyBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: MapPinned, title: "Message match", body: "The first promise mirrors the Facebook creative and UTM intent." },
                { icon: UserRoundCheck, title: "Trust before capture", body: "A useful routing answer or product proof arrives before the form." },
                { icon: CreditCard, title: "Self-serve stays visible", body: "The $1 product test remains a primary path, not a hidden pricing footnote." },
                { icon: CalendarDays, title: "Human help at high intent", body: "Scheduling appears after qualification and beside strong CTAs." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: concept.accentSoft, color: concept.accent }}><Icon className="h-5 w-5" /></span><p className="mt-5 text-sm font-black">{title}</p><p className="mt-2 text-xs leading-5 text-black/45">{body}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="lab-product-proof" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: concept.accent }}>Product evidence</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{concept.productTitle}</h2>
              <p className="mt-5 text-base leading-7 text-black/50">{concept.productBody}</p>
              <button onClick={openModal} className="mt-7 inline-flex items-center text-sm font-black" style={{ color: concept.accent }}>Open the guided proof <ChevronRight className="ml-1 h-4 w-4" /></button>
            </div>
            <div className="grid gap-4">
              {[
                { icon: Route, label: "Route board", title: "Recurring service stays intact when the day changes", copy: "Move a stop without losing the future series, customer window, or technician context." },
                { icon: CircleDollarSign, label: "Cash flow", title: "Completion, invoice, payment, and failed-card follow-up connect", copy: "The page demonstrates the workflow instead of promising that PestFlow simply 'helps you grow.'" },
                { icon: MessageSquareText, label: "Customer experience", title: "Updates, portal access, and review requests leave from one history", copy: "Visitors see the customer-facing result and the office record side by side." },
              ].map(({ icon: Icon, label, title, copy }, index) => (
                <div key={label} className="group grid gap-5 rounded-[26px] border border-black/[0.08] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: concept.accentSoft, color: concept.accent }}><Icon className="h-6 w-6" /></span>
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35">0{index + 1} · {label}</p><p className="mt-2 text-lg font-black leading-snug">{title}</p><p className="mt-2 text-sm leading-6 text-black/45">{copy}</p></div>
                  <ArrowRight className="hidden h-5 w-5 text-black/20 transition group-hover:translate-x-1 sm:block" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="lab-calendar" className="border-y border-black/[0.07] bg-[#111713] text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: concept.accent }}>{concept.calendarLabel}</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Calendar access, moved forward with intent.</h2>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/50">The strongest pattern is not a 720-pixel calendar in the hero. It is a clear “book setup” option beside the hero CTA, then an inline scheduler immediately after the visitor identifies a real problem.</p>
              <ul className="mt-7 space-y-3 text-sm text-white/60">{["15-minute workflow map", "No generic sales deck", "Bring one route, invoice, or migration question"].map(item => <li key={item} className="flex items-center gap-3"><span className="grid h-5 w-5 place-items-center rounded-full" style={{ background: concept.accent }}><Check className="h-3 w-3" /></span>{item}</li>)}</ul>
            </div>
            <div className="rounded-[26px] border border-white/10 bg-white/[0.055] p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-sm font-black">Choose a setup map</p><p className="mt-1 text-xs text-white/35">Times shown in your timezone</p></div><CalendarDays className="h-5 w-5 text-white/40" /></div>
              <div className="mt-5 grid grid-cols-5 gap-2 text-center">{["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => <button key={day} className={`rounded-xl border px-2 py-3 text-xs font-bold ${index === 1 ? "border-transparent text-white" : "border-white/10 text-white/45"}`} style={index === 1 ? { background: concept.accent } : undefined}><span className="block text-[9px] font-semibold uppercase tracking-widest opacity-60">{day}</span><span className="mt-1 block text-base">{14 + index}</span></button>)}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">{["9:30 AM", "11:00 AM", "1:30 PM", "2:45 PM", "4:00 PM", "Tomorrow"].map(slot => <button key={slot} onClick={openModal} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-bold text-white/65 hover:border-white/25 hover:text-white">{slot}</button>)}</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: concept.accent }}>Two legitimate next steps</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.04em] sm:text-6xl">Try the real product for $1.<br />Or map the setup first.</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-black/48">The page does not force every buyer into the same funnel. Self-serve buyers keep the path that already produced real payments, while trust-seeking buyers can schedule without downloading the app first.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={openModal} className="h-14 rounded-full px-8 text-sm font-bold text-white" style={{ background: concept.accent }}>Start the $1 product test</button><button onClick={scrollToCalendar} className="h-14 rounded-full border border-black/10 bg-white px-8 text-sm font-bold text-black/65">Book a setup map</button></div>
        </section>
      </main>
    </div>
  );
}
