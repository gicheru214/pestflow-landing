import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

const PDF_URL = "/pest-control-revenue-leak-playbook.pdf";

export default function Playbook() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [delivered, setDelivered] = useState(params.get("download") === "1");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", companyName: "" });

  useEffect(() => {
    document.title = "Free Pest Control Revenue Leak Playbook | PestFlow";
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          ...form,
          companyName: `${form.companyName || "Not provided"} | Revenue Leak Playbook | Source: ${params.get("utm_source") || params.get("source") || "direct"}`,
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setDelivered(true);
    } catch {
      setError("We couldn't save that yet. Please try once more.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f8f4] text-slate-950">
      <div className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" aria-label="PestFlow home">
            <img src={logoImage} alt="PestFlow" className="h-9 w-auto object-contain" />
          </a>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Free owner scorecard
          </span>
        </div>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">
              <ClipboardCheck className="h-4 w-4" /> 27 checks. Six leak categories. One Monday plan.
            </div>
            <h1 className="max-w-3xl font-heading text-4xl font-black leading-[1.03] tracking-tight text-[#123b24] sm:text-5xl lg:text-6xl">
              Find the revenue leaks hiding between the sale, the route, and the invoice.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              The Pest Control Revenue Leak Playbook is a practical 27-point scorecard for owners. Every check asks for proof your team can see: a queue, field, owner, date, record, or decision.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Recurring revenue", "Failed payments, skipped service, invoice handoffs"],
                ["Route capacity", "Drive time, route holes, job duration, arrival risk"],
                ["Field closeout", "Treatment records, photos, recaps, product usage"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm">
                  <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-600" />
                  <h2 className="font-bold text-[#123b24]">{title}</h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-[0_24px_80px_rgba(18,59,36,0.14)] sm:p-8">
            {delivered ? (
              <div className="py-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Download className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-2xl font-black text-[#123b24]">Your playbook is ready.</h2>
                <p className="mt-2 text-slate-600">Open the scorecard, mark each check 0–2, then use the final page to build your 7-day fix plan.</p>
                <Button asChild size="lg" className="mt-6 w-full bg-emerald-600 font-bold hover:bg-emerald-700">
                  <a href={PDF_URL} download>
                    Download the 27-point playbook <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <a href="https://app.pestflow.org/login" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
                  See PestFlow in action <ArrowRight className="inline h-4 w-4" />
                </a>
              </div>
            ) : (
              <>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Instant access</p>
                <h2 className="mt-2 text-2xl font-black text-[#123b24]">Get the full scorecard.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">No vague theory and no made-up benchmark. Just the operating checks and the evidence that proves each one is controlled.</p>
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input aria-label="First name" placeholder="First name" required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                    <Input aria-label="Last name" placeholder="Last name" required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
                  </div>
                  <Input aria-label="Work email" type="email" placeholder="Work email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  <Input aria-label="Company name" placeholder="Pest control company" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
                  {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
                  <Button type="submit" size="lg" disabled={submitting} className="w-full bg-emerald-600 font-bold hover:bg-emerald-700">
                    {submitting ? "Preparing your playbook…" : "Send me the playbook"}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Built for pest control owners. Unsubscribe anytime.
                </div>
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="border-y border-emerald-900/10 bg-[#123b24] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-3">
          {[
            ["0–21", "High leakage", "Fix ownership and visible evidence first."],
            ["22–39", "Unstable growth", "Standardize the weakest handoffs."],
            ["40–54", "Controlled system", "Improve speed, capacity, and exception handling."],
          ].map(([score, title, copy]) => (
            <div key={score}>
              <div className="text-3xl font-black text-emerald-400">{score}</div>
              <h2 className="mt-1 font-bold">{title}</h2>
              <p className="mt-1 text-sm text-emerald-50/70">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
