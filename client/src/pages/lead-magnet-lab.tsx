import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, Check, Clipboard, ExternalLink, FlaskConical, Shuffle } from "lucide-react";
import { LEAD_MAGNETS } from "@/lead-magnets/config";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return <button onClick={copy} className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-500 hover:border-slate-300 hover:text-slate-900">{copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy URL"}</button>;
}

export default function LeadMagnetLab() {
  const origin = useMemo(() => window.location.origin, []);
  const routerUrl = `${origin}/experiments/lead-magnets/assign?experiment=all-five`;

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-slate-900">
      <header className="border-b border-white/10 bg-[#0d1510] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="flex items-center justify-between gap-5"><div className="flex items-center gap-3"><img src={logoImage} alt="PestFlow" className="h-12 w-auto" /><div><p className="text-sm font-black">PestFlow Lead-Magnet Lab</p><p className="text-[10px] uppercase tracking-[.17em] text-white/35">Conversion-v2 staging environment</p></div></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">5 variants</span></div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[.16em] text-white/60"><FlaskConical className="h-3.5 w-3.5" />Experiment control center</div><h1 className="mt-5 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.05em] sm:text-7xl">Five independent pages. One clean comparison.</h1><p className="mt-6 max-w-2xl text-sm leading-7 text-white/50">Open each variant with internal analytics disabled, copy a traffic-ready URL, or use the persistent equal-split router to assign visitors automatically.</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center gap-2 text-emerald-300"><Shuffle className="h-4 w-4" /><p className="text-[10px] font-black uppercase tracking-[.16em]">Equal-split traffic router</p></div><p className="mt-3 break-all text-xs leading-5 text-white/55">{routerUrl}</p><div className="mt-4 grid grid-cols-2 gap-2"><CopyButton value={routerUrl} /><a href={`${routerUrl}&internal=1&reset=1`} className="flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-3 text-[10px] font-black text-white">Test assignment<ArrowRight className="h-3.5 w-3.5" /></a></div></div></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          {LEAD_MAGNETS.map((magnet) => {
            const internalUrl = `${origin}/experiments/lead-magnets/${magnet.id}?internal=1`;
            const trafficUrl = `${origin}/experiments/lead-magnets/${magnet.id}`;
            const Icon = magnet.icon;
            return (
              <article key={magnet.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: magnet.accentSoft, color: magnet.accent }}><Icon className="h-6 w-6" /></span><span className="rounded-full border border-slate-200 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">{magnet.experimentLabel}</span></div>
                  <h2 className="mt-6 text-3xl font-black tracking-[-.035em]">{magnet.shortName}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{magnet.body}</p>
                  <div className="mt-5 grid grid-cols-3 gap-2">{magnet.proof.map((item) => <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-sm font-black">{item.value}</p><p className="mt-1 text-[9px] leading-3 text-slate-400">{item.label}</p></div>)}</div>
                </div>
                <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:px-7"><div className="grid grid-cols-[1fr_auto] gap-2"><a href={internalUrl} className="flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black text-white" style={{ background: magnet.accent }}>Open staging page<ExternalLink className="h-3.5 w-3.5" /></a><CopyButton value={trafficUrl} /></div><p className="mt-3 truncate text-[9px] text-slate-400">{trafficUrl}</p></div>
              </article>
            );
          })}
        </div>

        <section className="mt-10 rounded-[26px] border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-900 text-white"><BarChart3 className="h-5 w-5" /></span><div><p className="text-lg font-black">Experiment contract</p><p className="text-xs text-slate-400">What is live in this staging environment</p></div></div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
            ["Lead capture", "Live", "Submissions save to the conversion-v2 Postgres database."],
            ["Attribution", "Live", "Variant, UTMs, assignment, route count, and team size are saved."],
            ["Analytics", "Traffic URLs", "Experiment URLs track unless ?internal=1 is present."],
            ["External providers", "Staged", "Calls, maps, official compliance, and bid feeds are previews only."],
          ].map(([title, status, copy]) => <div key={title} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between"><p className="text-xs font-black">{title}</p><span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase tracking-wider ${status === "Live" ? "bg-emerald-50 text-emerald-700" : status === "Traffic URLs" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{status}</span></div><p className="mt-3 text-[11px] leading-5 text-slate-500">{copy}</p></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
