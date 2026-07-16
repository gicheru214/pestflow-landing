import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Check, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { analytics } from "@/lib/analytics";

type Cell = boolean | string;

const rows: { label: string; pf: Cell; rival: Cell; winner: "pf" | "rival" | "tie" }[] = [
  { label: "Starting price", pf: "$40 / route", rival: "$49 / mo", winner: "pf" },
  { label: "SMS text messaging", pf: "Included", rival: "Paid add-on", winner: "pf" },
  { label: "Scales past 2–3 trucks", pf: true, rival: false, winner: "pf" },
  { label: "Route optimization", pf: true, rival: "Basic", winner: "pf" },
  { label: "Branded customer portal", pf: true, rival: "Limited", winner: "pf" },
  { label: "Advanced reporting", pf: true, rival: "Basic", winner: "pf" },
  { label: "Automated review requests", pf: true, rival: false, winner: "pf" },
  { label: "Easy for a brand-new solo op", pf: true, rival: true, winner: "tie" },
  { label: "Free for field technicians", pf: true, rival: false, winner: "pf" },
  { label: "Free data migration", pf: true, rival: "Partial", winner: "pf" },
];

function Mark({ value, win }: { value: Cell; win: boolean }) {
  if (value === true)
    return <Check className={`mx-auto h-5 w-5 ${win ? "text-emerald-600" : "text-slate-400"}`} strokeWidth={3} />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-red-400" strokeWidth={3} />;
  return <span className={`text-sm font-semibold ${win ? "text-emerald-700" : "text-slate-600"}`}>{value}</span>;
}

export default function CompetitorsGorillaDesk() {
  const videoRequested =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("video") === "1";

  useEffect(() => {
    if (!videoRequested) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("gorilladesk-migration-video")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [videoRequested]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* HERO */}
      <section className="border-b bg-secondary/30 px-4 py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Link href="/competitors">
            <span className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> All comparisons
            </span>
          </Link>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl">
            PestFlow <span className="text-slate-400">vs</span> <span className="text-emerald-700">GorillaDesk</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            GorillaDesk is a great first step for a solo operator. But teams past 2–3 trucks hit its limits fast.
            Here's where the gap shows up.
          </p>
        </div>
      </section>

      <section id="gorilladesk-migration-video" className="scroll-mt-20 border-b bg-slate-950 px-4 py-14 text-white">
        <div className="mx-auto grid max-w-4xl gap-7 md:grid-cols-[.75fr_1.25fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <PlayCircle className="h-4 w-4" /> 33-second walkthrough
            </div>
            <h2 className="mt-4 font-heading text-3xl font-extrabold leading-tight">Moving from GorillaDesk?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              See the fast path for bringing a GorillaDesk operation into PestFlow before deciding whether to start.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
            <div className="relative aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/3ie0svq4kT4?rel=0${videoRequested ? "&autoplay=1&mute=1" : ""}`}
                title="Move from GorillaDesk to PestFlow"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                onLoad={() => analytics.track("GorillaDesk Migration Video Viewed", { source: videoRequested ? "competitor_popup" : "comparison_page" })}
              />
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-slate-200 bg-slate-50">
            <div className="px-5 py-4 font-heading text-sm font-bold text-slate-500"></div>
            <div className="border-l border-slate-200 bg-emerald-600 px-4 py-4 text-center font-heading text-base font-extrabold text-white">
              PestFlow
            </div>
            <div className="border-l border-slate-200 px-4 py-4 text-center font-heading text-base font-extrabold text-slate-700">
              GorillaDesk
            </div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center ${
                i !== rows.length - 1 ? "border-b border-slate-100" : ""
              }`}
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-700">{r.label}</div>
              <div className="border-l border-slate-100 bg-emerald-50/50 px-4 py-4 text-center">
                <Mark value={r.pf} win={r.winner === "pf"} />
              </div>
              <div className="border-l border-slate-100 px-4 py-4 text-center">
                <Mark value={r.rival} win={r.winner === "rival"} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* THE TAKE */}
      <section className="bg-emerald-50/60 px-4 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">Where GorillaDesk fits</h3>
            <ul className="mt-4 space-y-3">
              {["Dead-simple for a brand-new solo op", "Low entry price, no contract", "Quick to learn in an afternoon"].map((t) => (
                <li key={t} className="flex gap-2.5 text-slate-700">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-600" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-heading text-xl font-extrabold text-slate-900">Where you outgrow it</h3>
            <ul className="mt-4 space-y-3">
              {["Stalls once you pass 2–3 trucks", "SMS is a paid add-on, not included", "Basic reporting & limited portal", "No automated review requests"].map((t) => (
                <li key={t} className="flex gap-2.5 text-slate-700">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-red-400" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold text-white">
            Room to grow, baked in.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-emerald-50">
            Same easy start — without the ceiling. Try PestFlow free for 7 days.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="mt-7 h-14 bg-white px-10 text-lg font-bold text-emerald-700 hover:bg-emerald-50">
              Start Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
