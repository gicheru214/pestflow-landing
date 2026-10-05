import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Check, ChevronDown, Handshake, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

type Application = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  ownerRelationships: string;
  introTiming: string;
  ownerSituation: string;
  website: string;
};

const initialApplication: Application = {
  name: "", email: "", phone: "", companyName: "", businessType: "",
  ownerRelationships: "", introTiming: "", ownerSituation: "", website: "",
};

const inputClass = "mt-1.5 h-12 w-full rounded-xl border border-[#d9e5d8] bg-white px-4 text-sm text-[#173824] outline-none transition focus:border-[#348a1a] focus:ring-2 focus:ring-[#348a1a]/15";
const labelClass = "block text-sm font-semibold text-[#24432e]";

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return <label className={labelClass}>
    {label}
    <span className="relative block">
      <select required value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        <option value="" disabled>Select one</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-5 h-4 w-4 text-[#587263]" />
    </span>
  </label>;
}

export default function ReferralPartners() {
  const [form, setForm] = useState<Application>(initialApplication);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Referral Partners | PestFlow";
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content");
    description?.setAttribute("content", "Already work with pest control owners? Make a warm introduction to PestFlow when an owner is exploring software. Apply to become a referral partner.");
    return () => {
      if (previousDescription !== null && previousDescription !== undefined) description?.setAttribute("content", previousDescription);
    };
  }, []);

  const update = (key: keyof Application, value: string) => setForm((current) => ({ ...current, [key]: value }));

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
          utmSource: params.get("utm_source") || "",
          utmCampaign: params.get("utm_campaign") || "",
          utmContent: params.get("utm_content") || "",
        }),
      });
      if (!response.ok) throw new Error("Your application could not be saved. Please try again.");
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Please try again.");
    } finally {
      setSending(false);
    }
  };

  return <main className="min-h-screen bg-[#f5f8f2] font-sans text-[#173824]">
    <div className="border-b border-[#dce9d8] bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
        <a href="/" aria-label="PestFlow home" className="flex items-center gap-2 font-heading text-2xl font-black tracking-tight text-[#173824]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#235c18] text-lg text-white">P</span>PestFlow</a>
        <a href="#apply" className="rounded-full bg-[#235c18] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#174511]">Apply to partner <ArrowRight className="ml-1 inline h-4 w-4" /></a>
      </div>
    </div>

    <section className="relative overflow-hidden bg-[#123b24] text-white">
      <div aria-hidden="true" className="absolute -right-48 -top-72 h-[700px] w-[700px] rounded-full border-[110px] border-[#245734]/50" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7dba6b]/40 bg-[#205433] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#c5f5aa]"><Handshake className="h-4 w-4" /> PestFlow referral partners</span>
          <h1 className="mt-7 max-w-2xl font-heading text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">Know pest control owners? <span className="text-[#a9ec82]">Make an introduction that fits.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#dfebdf]">If you already work with pest control businesses, you may know an owner who's starting out, using no software, or ready for a change. Introduce them to PestFlow when they're open to a conversation.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#apply" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b6ef87] px-7 py-4 font-bold text-[#153b20] shadow-lg shadow-black/10 transition hover:bg-[#ceffa4]">Apply to become a partner <ArrowRight className="h-5 w-5" /></a>
            <span className="text-sm text-[#d7e8d5]">Short application · No owner list needed</span>
          </div>
          <div className="mt-11 grid max-w-xl grid-cols-3 gap-4 border-t border-white/20 pt-6 text-sm text-[#dbe9da]">
            <div><Check className="mb-2 h-5 w-5 text-[#b6ef87]" />You make the warm introduction</div>
            <div><Check className="mb-2 h-5 w-5 text-[#b6ef87]" />We handle demos and onboarding</div>
            <div><Check className="mb-2 h-5 w-5 text-[#b6ef87]" />Commission if they become a paying customer</div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-sm lg:ml-auto">
          <div className="rounded-[1.5rem] bg-[#f7fbf4] p-6 text-[#173824] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#367c27]">A better referral conversation</p><h2 className="mt-2 font-heading text-2xl font-black leading-tight">The right moment sounds familiar.</h2></div>
              <div className="rounded-2xl bg-[#e2f3d8] p-3"><MessageCircle className="h-6 w-6 text-[#2f801b]" /></div>
            </div>
            <div className="mt-7 space-y-3">
              {["We're still running jobs from texts and a calendar.", "We just hired another tech. Our system isn't keeping up.", "We canceled our old software. What else is out there?"].map((quote) => <div key={quote} className="rounded-2xl border border-[#dcebd6] bg-white px-5 py-4 text-[15px] font-medium leading-6 shadow-sm">“{quote}”</div>)}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#e8f5df] px-5 py-4 text-sm font-semibold"><Sparkles className="h-5 w-5 shrink-0 text-[#348a1a]" /> If an owner wants to explore software, connect us. We'll take it from there.</div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 md:px-8 lg:py-20">
      <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.16em] text-[#367c27]">How it works</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">A warm introduction. A clear handoff.</h2><p className="mt-4 text-lg leading-8 text-[#577060]">You keep the relationship. The PestFlow team handles the software conversation.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {[
          ["01", "Know the owner", "You already work with a pest control owner who's open to their first system or a different one."],
          ["02", "Connect us", "Make a warm introduction with the owner's permission. We'll handle the demo and onboarding."],
          ["03", "Get paid if they do", "You earn a referral commission if the company becomes a paying PestFlow customer. We'll share the terms before you make an introduction."],
        ].map(([number, title, body]) => <div key={number} className="rounded-3xl border border-[#dce9d8] bg-white p-7 shadow-sm"><span className="font-heading text-3xl font-black text-[#83c960]">{number}</span><h3 className="mt-5 font-heading text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-[#5a6f60]">{body}</p></div>)}
      </div>
    </section>

    <section className="border-y border-[#dce9d8] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#367c27]">Who this is for</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">Relationships first. Job title second.</h2><p className="mt-5 text-lg leading-8 text-[#577060]">Agencies, bookkeepers, suppliers, consultants, and other service providers can be a fit. What matters is that you already know pest control owners and can make a genuine introduction soon.</p></div>
        <div className="rounded-3xl bg-[#f1f7ec] p-7 sm:p-9"><h3 className="font-heading text-xl font-black">A strong fit looks like this</h3><ul className="mt-5 space-y-4 text-sm leading-6 text-[#3a5743]">{["You already serve or work directly with pest control owners.", "At least one owner comes to mind who may want to discuss software soon.", "You can introduce us personally, with the owner's permission.", "You want the PestFlow team to handle the demo and onboarding."].map((item) => <li key={item} className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#348a1a]" />{item}</li>)}</ul></div>
      </div>
    </section>

    <section id="apply" className="mx-auto grid max-w-7xl scroll-mt-10 gap-10 px-5 py-16 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
      <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#367c27]">Partner application</p><h2 className="mt-3 font-heading text-4xl font-black tracking-tight">Tell us who you work with.</h2><p className="mt-5 text-lg leading-8 text-[#577060]">This is a short conversation starter, not a request for your client list. We'll review your fit and follow up about the partner terms.</p><p className="mt-8 rounded-2xl border border-[#d6e8cf] bg-white p-5 text-sm leading-6 text-[#486251]">PestFlow helps small residential pest control businesses manage scheduling, jobs, service reports, invoicing, and payments.</p></div>
      <div className="rounded-3xl border border-[#dce9d8] bg-white p-6 shadow-[0_20px_80px_rgba(28,70,30,0.08)] sm:p-9">
        {submitted ? <div role="status" className="py-14 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f6db]"><Check className="h-8 w-8 text-[#348a1a]" /></div><h3 className="mt-6 font-heading text-3xl font-black">Thanks for applying.</h3><p className="mx-auto mt-3 max-w-sm leading-7 text-[#577060]">We received your information. The PestFlow team will review it and contact you about next steps and commission terms.</p></div> : <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2"><label className={labelClass}>Your name<input required autoComplete="name" className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} /></label><label className={labelClass}>Work email<input required type="email" autoComplete="email" className={inputClass} value={form.email} onChange={(event) => update("email", event.target.value)} /></label></div>
          <div className="grid gap-5 sm:grid-cols-2"><label className={labelClass}>Your business<input required autoComplete="organization" className={inputClass} value={form.companyName} onChange={(event) => update("companyName", event.target.value)} /></label><label className={labelClass}>Phone <span className="font-normal text-[#718676]">(optional)</span><input type="tel" autoComplete="tel" className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="What does your business do?" value={form.businessType} onChange={(value) => update("businessType", value)} options={[{value:"agency",label:"Marketing agency"},{value:"bookkeeper",label:"Bookkeeping / accounting"},{value:"supplier",label:"Supplier / distributor"},{value:"consultant",label:"Consulting"},{value:"other",label:"Something else"}]} />
            <SelectField label="Pest owners you work with" value={form.ownerRelationships} onChange={(value) => update("ownerRelationships", value)} options={[{value:"0",label:"None yet"},{value:"1",label:"One"},{value:"2-5",label:"Two to five"},{value:"6+",label:"Six or more"}]} />
          </div>
          <SelectField label="When could you make a warm introduction?" value={form.introTiming} onChange={(value) => update("introTiming", value)} options={[{value:"this_week",label:"This week"},{value:"two_weeks",label:"Within two weeks"},{value:"later",label:"Later"},{value:"unsure",label:"Not sure yet"}]} />
          <label className={labelClass}>What kind of owner comes to mind? <span className="font-normal text-[#718676]">(optional)</span><textarea rows={3} maxLength={500} placeholder="For example: starting out, using paper, or thinking about changing software" className="mt-1.5 w-full resize-y rounded-xl border border-[#d9e5d8] bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-[#348a1a] focus:ring-2 focus:ring-[#348a1a]/15" value={form.ownerSituation} onChange={(event) => update("ownerSituation", event.target.value)} /></label>
          <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#235c18] px-6 py-4 font-bold text-white transition hover:bg-[#174511] disabled:cursor-wait disabled:opacity-60">{sending ? "Sending…" : "Apply to partner"}<ArrowRight className="h-5 w-5" /></button>
          <p className="text-xs leading-5 text-[#68806d]">By applying, you agree that PestFlow may contact you about this partner program. See our <a className="font-semibold underline" href="/privacy">privacy policy</a>. Paid recommendations should be disclosed where required.</p>
        </form>}
      </div>
    </section>

    <footer className="border-t border-[#dce9d8] bg-white px-5 py-6 text-center text-xs text-[#68806d]">© {new Date().getFullYear()} Reflectly AI, Inc. · PestFlow · <a href="/privacy" className="underline">Privacy</a> · <a href="/terms" className="underline">Terms</a></footer>
  </main>;
}
