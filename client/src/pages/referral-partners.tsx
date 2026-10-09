import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown, Handshake, MessageCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { rememberReferralPartnerApplication } from "@/lib/referralPartnerConversion";
import { limitPhoneInput, nanpNationalDigits, nanpPhoneErrorMessage } from "@shared/phone";

type Application = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  businessTypeOther: string;
  ownerRelationships: string;
  introTiming: string;
  ownerSituation: string;
  website: string;
};

const initialApplication: Application = {
  name: "", email: "", phone: "", companyName: "", businessType: "", businessTypeOther: "",
  ownerRelationships: "", introTiming: "", ownerSituation: "", website: "",
};
const POPUP_SEEN_KEY = "pestflow_referral_partner_popup_seen";
const hasDraftContent = (form: Application) => (
  [form.name, form.email, form.phone, form.companyName, form.businessType,
    form.businessTypeOther, form.ownerRelationships, form.introTiming, form.ownerSituation]
    .some((value) => value.trim().length > 0)
);

const inputClass = "mt-1 h-10 w-full rounded-xl border border-[#c0ecac] bg-white px-3 text-base text-[#0d280a] outline-none transition focus:border-[#348a1a] focus:ring-2 focus:ring-[#348a1a]/15 sm:mt-1.5 sm:h-12 sm:px-4 sm:text-sm";
const labelClass = "block text-xs font-semibold text-[#225810] sm:text-sm";

function SelectField({ label, value, onChange, options, compact = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  compact?: boolean;
}) {
  return <label className={labelClass}>
    {label}
    <span className="relative block">
      <select required value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        <option value="" disabled>Select one</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className={`pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#296e14] ${compact ? "sm:top-5" : "sm:right-4 sm:top-5"}`} />
    </span>
  </label>;
}

function PartnerApplicationForm({ form, update, submit, sending, error, compact = false, onStepChange }: {
  form: Application;
  update: (key: keyof Application, value: string) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  error: string;
  compact?: boolean;
  onStepChange?: (step: 1 | 2) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [stepError, setStepError] = useState("");
  const [optionalOpen, setOptionalOpen] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 2) return submit(event);
    const phoneError = nanpPhoneErrorMessage(form.phone);
    if (form.name.trim().length < 2) return setStepError("Please enter your full name.");
    if (phoneError) return setStepError(phoneError);
    if (form.businessType === "other" && !form.businessTypeOther.trim()) return setStepError("Please describe what your business does.");
    setStepError("");
    setStep(2);
    onStepChange?.(2);
  };

  return <form onSubmit={handleSubmit} className={compact ? "space-y-3 sm:space-y-5" : "space-y-5"}>
    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-[#296e14]"><span>Step {step} of 2</span><span>{step === 1 ? "About you" : "Your connections"}</span></div>
    <div className="flex gap-2" aria-hidden="true"><span className="h-1.5 flex-1 rounded-full bg-[#348a1a]" /><span className={`h-1.5 flex-1 rounded-full ${step === 2 ? "bg-[#348a1a]" : "bg-[#e0f5d5]"}`} /></div>
    {step === 1 ? <>
      <label className={labelClass}>Full name <span aria-hidden="true">*</span><input required minLength={2} autoComplete="name" className={inputClass} value={form.name} onChange={(event) => { update("name", event.target.value); setStepError(""); }} /></label>
      <label className={labelClass}>Phone number <span aria-hidden="true">*</span><span className="relative block"><span aria-hidden="true" className="absolute left-4 top-2.5 text-sm font-semibold text-[#225810] sm:top-[1.16rem]">+1</span><input required type="tel" inputMode="numeric" autoComplete="tel-national" aria-label="Phone number after +1" placeholder="2145550123" className={`${inputClass} pl-12`} value={form.phone} onChange={(event) => { update("phone", limitPhoneInput(event.target.value)); setStepError(""); }} /></span></label>
      <SelectField label="What does your business do?" value={form.businessType} onChange={(value) => { update("businessType", value); setStepError(""); }} options={[{value:"agency",label:"Marketing agency"},{value:"bookkeeper",label:"Bookkeeping / accounting"},{value:"supplier",label:"Supplier / distributor"},{value:"consultant",label:"Consulting"},{value:"other",label:"Something else"}]} />
      {form.businessType === "other" && <label className={labelClass}>Describe your business <span aria-hidden="true">*</span><input required maxLength={120} placeholder="What service do you provide?" className={inputClass} value={form.businessTypeOther} onChange={(event) => { update("businessTypeOther", event.target.value); setStepError(""); }} /></label>}
      {stepError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{stepError}</p>}
      <button type="submit" className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#348a1a] px-6 font-bold text-white transition hover:bg-[#296e14] ${compact ? "py-2.5 sm:py-4" : "py-4"}`}>Continue <ArrowRight className="h-5 w-5" /></button>
    </> : <>
      <div className={compact ? "grid grid-cols-2 gap-2.5 sm:gap-5" : "grid gap-5 sm:grid-cols-2"}><label className={labelClass}>Work email <span aria-hidden="true">*</span><input required type="email" autoComplete="email" className={inputClass} value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label className={labelClass}>Your business <span aria-hidden="true">*</span><input required autoComplete="organization" className={inputClass} value={form.companyName} onChange={(event) => update("companyName", event.target.value)} /></label></div>
      <div className={compact ? "grid grid-cols-2 gap-2.5 sm:gap-5" : "grid gap-5 sm:grid-cols-2"}><SelectField compact={compact} label={compact ? "Pest owners you know" : "Pest owners you work with"} value={form.ownerRelationships} onChange={(value) => update("ownerRelationships", value)} options={[{value:"0",label:"None yet"},{value:"1",label:"One"},{value:"2-5",label:"Two to five"},{value:"6+",label:"Six or more"}]} /><SelectField compact={compact} label={compact ? "When could you introduce?" : "When could you make a warm introduction?"} value={form.introTiming} onChange={(value) => update("introTiming", value)} options={[{value:"this_week",label:"This week"},{value:"two_weeks",label:"Within two weeks"},{value:"later",label:"Later"},{value:"unsure",label:"Not sure yet"}]} /></div>
      {compact && <button type="button" aria-expanded={optionalOpen} onClick={() => setOptionalOpen((open) => !open)} className="flex w-full items-center justify-between rounded-lg border border-[#c0ecac] px-3 py-2 text-left text-xs font-semibold text-[#225810] sm:hidden">Anything else about the owner? (optional)<ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${optionalOpen ? "rotate-180" : ""}`} /></button>}
      {(!compact || optionalOpen) && <label className={`${labelClass} ${compact ? "sm:hidden" : ""}`}>What kind of owner comes to mind? <span className="font-normal text-[#718676]">(optional)</span><textarea rows={compact ? 2 : 3} maxLength={500} placeholder="For example: starting out, using paper, or thinking about changing software" className="mt-1.5 w-full resize-y rounded-xl border border-[#c0ecac] bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-[#348a1a] focus:ring-2 focus:ring-[#348a1a]/15 sm:text-sm" value={form.ownerSituation} onChange={(event) => update("ownerSituation", event.target.value)} /></label>}
      {compact && <label className={`${labelClass} hidden sm:block`}>What kind of owner comes to mind? <span className="font-normal text-[#718676]">(optional)</span><textarea rows={3} maxLength={500} placeholder="For example: starting out, using paper, or thinking about changing software" className="mt-1.5 w-full resize-y rounded-xl border border-[#c0ecac] bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#348a1a] focus:ring-2 focus:ring-[#348a1a]/15" value={form.ownerSituation} onChange={(event) => update("ownerSituation", event.target.value)} /></label>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="flex gap-2.5 sm:gap-3"><button type="button" disabled={sending} onClick={() => { setStep(1); onStepChange?.(1); }} className={`rounded-xl border border-[#c0ecac] px-4 font-semibold text-[#225810] hover:bg-[#f2fbee] sm:px-5 ${compact ? "py-2.5 sm:py-4" : "py-4"}`}>Back</button><button type="submit" disabled={sending} className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#348a1a] px-3 font-bold text-white transition hover:bg-[#296e14] disabled:cursor-wait disabled:opacity-60 sm:px-6 ${compact ? "py-2.5 sm:py-4" : "py-4"}`}>{sending ? "Sending…" : "Apply to partner"}<ArrowRight className="h-5 w-5" /></button></div>
    </>}
    <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label></div>
    <p className={compact ? "text-[10px] leading-4 text-[#68806d] sm:text-xs sm:leading-5" : "text-xs leading-5 text-[#68806d]"}>Information you enter may be saved even if you leave before applying. By applying, you agree that PestFlow may contact you about this partner program. See our <a className="font-semibold underline" href="/privacy">privacy policy</a>. Paid recommendations should be disclosed where required.</p>
  </form>;
}

export default function ReferralPartners() {
  const [form, setForm] = useState<Application>(initialApplication);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStep, setPopupStep] = useState<1 | 2>(1);
  const skipTimedPopup = useRef(false);
  const draftId = useRef(crypto.randomUUID());
  const draftRevision = useRef(0);
  const latestForm = useRef(form);
  const completed = useRef(false);

  const draftPayload = (value: Application, revision: number) => {
    const params = new URLSearchParams(window.location.search);
    return JSON.stringify({
      ...value,
      draftId: draftId.current,
      revision,
      utmSource: params.get("utm_source") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
    });
  };

  useEffect(() => {
    if (!hasDraftContent(form) || form.website || completed.current) return;
    const timer = window.setTimeout(() => {
      void fetch("/api/referral-partners/partial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: draftPayload(form, draftRevision.current),
        keepalive: true,
      }).catch(() => { /* The pagehide beacon provides a second save opportunity. */ });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    const saveOnExit = () => {
      if (completed.current || latestForm.current.website || !hasDraftContent(latestForm.current)) return;
      navigator.sendBeacon("/api/referral-partners/partial", new Blob(
        [draftPayload(latestForm.current, draftRevision.current)],
        { type: "application/json" },
      ));
    };
    window.addEventListener("pagehide", saveOnExit);
    return () => window.removeEventListener("pagehide", saveOnExit);
  }, []);

  useEffect(() => {
    document.title = "Referral Partners | PestFlow";
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    description?.setAttribute("content", "Already work with pest control owners? Make a warm introduction to PestFlow when an owner is exploring software. Apply to become a referral partner.");
    return () => {
      if (previousDescription !== null && previousDescription !== undefined) description?.setAttribute("content", previousDescription);
    };
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(POPUP_SEEN_KEY) === "1") return;
    } catch {
      // Still show the invitation once if storage is unavailable.
    }
    const timer = window.setTimeout(() => {
      if (skipTimedPopup.current || window.location.hash === "#apply" || window.scrollY > 400) return;
      setPopupOpen(true);
      try { sessionStorage.setItem(POPUP_SEEN_KEY, "1"); } catch { /* no-op */ }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const goToPageForm = () => {
    skipTimedPopup.current = true;
    setPopupOpen(false);
    try { sessionStorage.setItem(POPUP_SEEN_KEY, "1"); } catch { /* no-op */ }
  };

  const update = (key: keyof Application, value: string) => setForm((current) => {
    draftRevision.current += 1;
    latestForm.current = { ...current, [key]: value };
    return latestForm.current;
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/referral-partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          draftId: draftId.current,
          phone: nanpNationalDigits(form.phone),
          utmSource: params.get("utm_source") || "",
          utmCampaign: params.get("utm_campaign") || "",
          utmContent: params.get("utm_content") || "",
        }),
      });
      if (!response.ok) throw new Error("Your application could not be saved. Please try again.");
      const saved = await response.json() as { applicationId?: string };
      if (!saved.applicationId) throw new Error("Your application could not be confirmed. Please try again.");
      completed.current = true;
      if (rememberReferralPartnerApplication(saved.applicationId)) {
        window.location.assign("/referral-partners/thanks");
      } else {
        setSubmitted(true);
        setPopupOpen(false);
        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return <main className="min-h-screen bg-emerald-50 font-sans text-[#0d280a]">
    <div className="border-b border-emerald-200 bg-white">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="/" aria-label="PestFlow home"><img src={logoImage} alt="PestFlow" className="h-24 w-auto object-contain sm:h-28" /></a>
        <a href="#apply" onClick={goToPageForm} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700">Apply to partner <ArrowRight className="ml-1 inline h-4 w-4" /></a>
      </div>
    </div>

    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white">
      <div aria-hidden="true" className="absolute -right-48 -top-72 h-[700px] w-[700px] rounded-full border-[110px] border-emerald-600/20" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><Handshake className="h-4 w-4" /> PestFlow referral partners</span>
          <h1 className="mt-7 max-w-2xl font-heading text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">Know pest control owners? <span className="text-emerald-400">Make an introduction that fits.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#e0f5d5]">If you already work with pest control businesses, you may know an owner who's starting out, using no software, or ready for a change. Introduce them to PestFlow when they're open to a conversation.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#apply" onClick={goToPageForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700">Apply to become a partner <ArrowRight className="h-5 w-5" /></a>
            <span className="text-sm text-[#e0f5d5]">Short application · No owner list needed</span>
          </div>
          <div className="mt-11 grid max-w-xl grid-cols-3 gap-4 border-t border-white/20 pt-6 text-sm text-[#e0f5d5]">
            <div><Check className="mb-2 h-5 w-5 text-[#5ec23e]" />You make the warm introduction</div>
            <div><Check className="mb-2 h-5 w-5 text-[#5ec23e]" />We handle demos and onboarding</div>
            <div><Check className="mb-2 h-5 w-5 text-[#5ec23e]" />Commission if they become a paying customer</div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-sm lg:ml-auto">
          <div className="rounded-[1.5rem] bg-[#f2fbee] p-6 text-[#0d280a] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#296e14]">A better referral conversation</p><h2 className="mt-2 font-heading text-2xl font-black leading-tight">The right moment sounds familiar.</h2></div>
              <div className="rounded-2xl bg-[#e0f5d5] p-3"><MessageCircle className="h-6 w-6 text-[#348a1a]" /></div>
            </div>
            <div className="mt-7 space-y-3">
              {["We're still running jobs from texts and a calendar.", "We just hired another tech. Our system isn't keeping up.", "We canceled our old software. What else is out there?"].map((quote) => <div key={quote} className="rounded-2xl border border-[#c0ecac] bg-white px-5 py-4 text-[15px] font-medium leading-6 shadow-sm">“{quote}”</div>)}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#e0f5d5] px-5 py-4 text-sm font-semibold"><Sparkles className="h-5 w-5 shrink-0 text-[#348a1a]" /> If an owner wants to explore software, connect us. We'll take it from there.</div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-20">
      <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#296e14]">How it works</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">A warm introduction. A clear handoff.</h2><p className="mt-4 text-lg leading-8 text-[#577060]">You keep the relationship. The PestFlow team handles the software conversation.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {[
          ["01", "Know the owner", "You already work with a pest control owner who's open to their first system or a different one."],
          ["02", "Connect us", "Make a warm introduction with the owner's permission. We'll handle the demo and onboarding."],
          ["03", "Get paid if they do", "You earn a referral commission if the company becomes a paying PestFlow customer. We'll share the terms before you make an introduction."],
        ].map(([number, title, body]) => <div key={number} className="rounded-3xl border border-[#c0ecac] bg-white p-7 shadow-sm"><span className="font-heading text-3xl font-black text-[#42a824]">{number}</span><h3 className="mt-5 font-heading text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5a6f60]">{body}</p></div>)}
      </div>
    </section>

    <section className="border-y border-[#c0ecac] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#296e14]">Who this is for</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">Relationships first. Job title second.</h2><p className="mt-5 text-lg leading-8 text-[#577060]">Agencies, bookkeepers, suppliers, consultants, and other service providers can be a fit. What matters is that you already know pest control owners and can make a genuine introduction soon.</p></div>
        <div className="rounded-3xl bg-[#f2fbee] p-7 sm:p-9"><h3 className="font-heading text-xl font-black">A strong fit looks like this</h3><ul className="mt-5 space-y-4 text-sm leading-6 text-[#225810]">{["You already serve or work directly with pest control owners.", "At least one owner comes to mind who may want to discuss software soon.", "You can introduce us personally, with the owner's permission.", "You want the PestFlow team to handle the demo and onboarding."].map((item) => <li key={item} className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#348a1a]" />{item}</li>)}</ul></div>
      </div>
    </section>

    <section id="apply" className="mx-auto grid max-w-7xl scroll-mt-10 gap-10 px-5 py-16 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
      <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#296e14]">Partner application</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">Tell us who you work with.</h2><p className="mt-5 text-lg leading-8 text-[#577060]">This is a short conversation starter, not a request for your client list. We'll review your fit and follow up about the partner terms.</p><p className="mt-8 rounded-2xl border border-[#c0ecac] bg-white p-5 text-sm leading-6 text-[#225810]">PestFlow helps small residential pest control businesses manage scheduling, jobs, service reports, invoicing, and payments.</p></div>
      <div className="rounded-3xl border border-[#c0ecac] bg-white p-6 shadow-[0_20px_80px_rgba(28,70,30,0.08)] sm:p-9">
        {submitted ? <div role="status" className="py-14 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e0f5d5]"><Check className="h-8 w-8 text-[#348a1a]" /></div><h3 className="mt-6 font-heading text-3xl font-black">Thanks for applying.</h3><p className="mx-auto mt-3 max-w-sm leading-7 text-[#577060]">We received your information. The PestFlow team will review it and contact you about next steps and commission terms.</p></div> : <PartnerApplicationForm form={form} update={update} submit={submit} sending={sending} error={error} />}
      </div>
    </section>

    <Dialog open={popupOpen && !submitted} onOpenChange={setPopupOpen}>
      <DialogContent hideCloseButton className="z-[1000010] max-h-[calc(100dvh-0.75rem)] w-[calc(100vw-0.75rem)] overflow-y-auto rounded-3xl border-[#c0ecac] bg-white p-0 sm:max-w-[560px]">
        <button type="button" aria-label="Close partner invitation" onClick={() => setPopupOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 text-[#225810] shadow-sm hover:bg-[#f2fbee] sm:right-4 sm:top-4"><X className="h-5 w-5" /></button>
        <div className="px-4 pb-2 pt-3 sm:px-8 sm:pb-5 sm:pt-5">
          <img src={logoImage} alt="PestFlow" className="h-9 w-auto object-contain sm:h-16" />
          <DialogTitle className="mt-1 pr-8 font-heading text-lg font-black leading-tight text-[#0d280a] sm:mt-2 sm:pr-0 sm:text-3xl"><span className="sm:hidden">{popupStep === 1 ? "Know pest control owners?" : "Tell us about your connections."}</span><span className="hidden sm:inline">Already work with pest control owners?</span></DialogTitle>
          <DialogDescription className="sr-only sm:not-sr-only sm:mt-3 sm:text-sm sm:leading-6 sm:text-[#577060]">When an owner is starting out, using no software, or considering a change, you can make a warm introduction to PestFlow.</DialogDescription>
        </div>
        <div className="hidden border-y border-[#c0ecac] bg-[#f2fbee] px-6 py-4 sm:block sm:px-8">
          <ul className="space-y-2 text-sm font-medium leading-5 text-[#225810]">
            <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#348a1a]" /> You introduce us with the owner’s permission.</li>
            <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#348a1a]" /> PestFlow handles the demo and onboarding.</li>
            <li className="flex gap-2"><Check className="h-5 w-5 shrink-0 text-[#348a1a]" /> You earn a commission if they become a paying customer.</li>
          </ul>
        </div>
        <div className="px-4 pb-3 pt-1 sm:px-8 sm:pb-7 sm:pt-5">
          <p className="mb-4 hidden text-sm font-bold text-[#0d280a] sm:block">Tell us about the pest businesses you already know.</p>
          <PartnerApplicationForm form={form} update={update} submit={submit} sending={sending} error={error} compact onStepChange={setPopupStep} />
        </div>
      </DialogContent>
    </Dialog>

    <footer className="border-t border-[#c0ecac] bg-white px-5 py-6 text-center text-xs text-[#68806d]">© {new Date().getFullYear()} Reflectly AI, Inc. · PestFlow · <a href="/privacy" className="underline">Privacy</a> · <a href="/terms" className="underline">Terms</a></footer>
  </main>;
}
