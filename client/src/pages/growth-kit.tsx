import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Calculator, Check, ClipboardCheck, Download, Gauge, MessageSquareText, Printer, ShieldCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

const categories = [
  { name: "Recurring revenue", checks: ["Valid payment method coverage", "Service-to-invoice handoff", "Failed-payment recovery", "Skipped-service recovery", "Agreement and price control"] },
  { name: "Route capacity", checks: ["Stops per route day", "Windshield time", "Recoverable route holes", "Actual job duration", "Arrival-window risk"] },
  { name: "Technician closeout", checks: ["Treatment record", "Photos and findings", "Customer recap", "Product usage", "Completion gate"] },
  { name: "Estimate recovery", checks: ["Response speed", "Next-action ownership", "Useful follow-up sequence", "Lost-reason learning"] },
  { name: "Retention", checks: ["Re-service ownership", "Cancellation save ladder", "Proactive arrival updates", "Reason-coded callbacks"] },
  { name: "Owner visibility", checks: ["Cash exceptions", "Route economics", "Quality completion", "Weekly action review"] },
];

const savePlans: Record<string, string[]> = {
  price: ["Confirm the customer's service history and current scope.", "Explain what the program has prevented or resolved.", "Offer a scope or frequency adjustment before a blind discount.", "Set the next review date and owner."],
  results: ["Acknowledge the gap without arguing.", "Review the last treatment record, access, weather, and expectation.", "Book the corrective inspection with a named owner.", "Send the customer the exact next checkpoint."],
  communication: ["Name the missed promise or unclear expectation.", "Give one owner and one update time.", "Complete the promised action before adding another message.", "Close the loop in writing."],
  moving: ["Confirm whether service can transfer to a new property.", "Clarify final service, balance, and access.", "Ask permission to help the new occupant or property contact.", "Record the true cancellation reason."],
};

const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

export default function GrowthKit() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const [unlocked, setUnlocked] = useState(params.get("download") === "1" || localStorage.getItem("pestflow_growth_kit") === "unlocked");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", companyName: "" });
  const [scores, setScores] = useState<Record<string, number>>({});
  const [route, setRoute] = useState({ revenue: 2400, techHours: 10, hourlyBurden: 34, miles: 95, vehicleCost: 0.78, product: 180, callbacks: 1, callbackCost: 145 });
  const [estimate, setEstimate] = useState({ customer: "Jordan", pest: "rodent issue", recommendation: "exclusion and monitoring plan", booking: "Tuesday or Thursday" });
  const [cancelReason, setCancelReason] = useState("price");

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const labor = route.techHours * route.hourlyBurden;
  const vehicle = route.miles * route.vehicleCost;
  const callback = route.callbacks * route.callbackCost;
  const routeProfit = route.revenue - labor - vehicle - route.product - callback;
  const routeMargin = route.revenue ? routeProfit / route.revenue : 0;

  const categoryScores = categories.map((category) => ({
    name: category.name,
    score: category.checks.reduce((sum, check) => sum + (scores[`${category.name}:${check}`] || 0), 0),
    max: category.checks.length * 2,
  }));
  const lowest = [...categoryScores].sort((a, b) => (a.score / a.max) - (b.score / b.max)).slice(0, 3);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          ...form,
          companyName: `${form.companyName || "Not provided"} | Revenue Recovery Kit | Source: ${params.get("utm_source") || "direct"}`,
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      localStorage.setItem("pestflow_growth_kit", "unlocked");
      setUnlocked(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#f4f8f4] text-slate-950">
        <div className="border-b border-emerald-900/10 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <a href="/"><img src={logoImage} alt="PestFlow" className="h-9 w-auto" /></a>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Free owner toolkit</span>
          </div>
        </div>
        <section className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-bold text-emerald-800"><Target className="h-4 w-4" /> Built for pest-control owners</div>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-black leading-[1.02] tracking-tight text-[#123b24] sm:text-6xl">Find the leak. Price the route. Recover the quote. Save the customer.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">The Pest Control Revenue Recovery Kit turns five owner problems into usable tools—not another PDF that gets forgotten in Downloads.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                [ClipboardCheck, "27-point operating audit", "Score six systems using visible proof."],
                [Calculator, "Route-profit calculator", "See labor, drive, product, and callback cost."],
                [MessageSquareText, "Estimate recovery scripts", "Generate three useful follow-ups."],
                [ShieldCheck, "Cancellation save ladder", "Match the recovery plan to the real reason."],
                [Gauge, "Monday owner plan", "Turn the weakest three areas into named actions."],
              ].map(([Icon, title, copy]) => {
                const ToolIcon = Icon as typeof ClipboardCheck;
                return <div key={String(title)} className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-sm"><ToolIcon className="h-5 w-5 text-emerald-600" /><h2 className="mt-3 font-black text-[#123b24]">{String(title)}</h2><p className="mt-1 text-sm text-slate-500">{String(copy)}</p></div>;
              })}
            </div>
          </div>
          <aside className="rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-[0_24px_80px_rgba(18,59,36,0.14)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Instant access</p>
            <h2 className="mt-2 text-3xl font-black text-[#123b24]">Open the full kit.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use every calculator and script in your browser. Print the action plan when you finish.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input required placeholder="First name" aria-label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
                <Input required placeholder="Last name" aria-label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              </div>
              <Input required type="email" placeholder="Work email" aria-label="Work email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <Input placeholder="Pest-control company" aria-label="Company" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
              <Button disabled={submitting} size="lg" className="w-full bg-emerald-600 font-black hover:bg-emerald-700">{submitting ? "Opening your kit…" : "Open my Revenue Recovery Kit"}<ArrowRight className="ml-2 h-4 w-4" /></Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">No vague benchmark claims. Every result shows the inputs behind it.</p>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f8f4] text-slate-950 print:bg-white">
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-white/95 backdrop-blur print:static">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <a href="/"><img src={logoImage} alt="PestFlow" className="h-9 w-auto" /></a>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" asChild><a href="/pest-control-revenue-leak-playbook.pdf" download><Download className="mr-2 h-4 w-4" />Scorecard PDF</a></Button>
            <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700"><Printer className="mr-2 h-4 w-4" />Print my plan</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">PestFlow Revenue Recovery Kit</p>
        <h1 className="mt-2 font-heading text-4xl font-black text-[#123b24]">Your operating leak score: {totalScore} / 54</h1>
        <p className="mt-3 max-w-3xl text-slate-600">Use 0 when the workflow depends on memory, 1 when it is inconsistent, and 2 when it creates visible evidence, an owner, and a next action.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="grid gap-5 lg:grid-cols-2">
          {categories.map((category) => {
            const categoryScore = categoryScores.find((item) => item.name === category.name)!;
            return (
              <article key={category.name} className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm break-inside-avoid">
                <div className="flex items-center justify-between"><h2 className="text-xl font-black text-[#123b24]">{category.name}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">{categoryScore.score}/{categoryScore.max}</span></div>
                <div className="mt-5 space-y-3">
                  {category.checks.map((check) => {
                    const key = `${category.name}:${check}`;
                    return <div key={check} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">{check}</span><div className="flex gap-1">{[0, 1, 2].map((score) => <button key={score} onClick={() => setScores({ ...scores, [key]: score })} className={`h-8 w-8 rounded-lg text-sm font-black ${scores[key] === score ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-500"}`}>{score}</button>)}</div></div>;
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-emerald-900/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tool 2</p>
            <h2 className="mt-2 text-3xl font-black text-[#123b24]">Route-day profit calculator</h2>
            <p className="mt-3 text-slate-600">Price the full day: labor, windshield miles, product, and callback cost.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {Object.entries({ revenue: "Route revenue", techHours: "Tech hours", hourlyBurden: "Hourly burden", miles: "Miles driven", vehicleCost: "Vehicle cost/mile", product: "Product cost", callbacks: "Expected callbacks", callbackCost: "Cost per callback" }).map(([key, label]) => <label key={key} className="text-xs font-bold text-slate-600">{label}<Input type="number" step="0.01" value={route[key as keyof typeof route]} onChange={(event) => setRoute({ ...route, [key]: Number(event.target.value) })} className="mt-1" /></label>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['Revenue', money(route.revenue)], ['Labor', money(labor)], ['Vehicle', money(vehicle)], ['Product', money(route.product)], ['Callback risk', money(callback)], ['Route profit', money(routeProfit)]].map(([label, value]) => <div key={label} className="rounded-2xl border border-emerald-900/10 bg-[#f4f8f4] p-5"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-[#123b24]">{value}</p></div>)}
            <div className={`rounded-2xl p-5 text-white sm:col-span-2 ${routeMargin >= 0.35 ? "bg-emerald-600" : routeMargin >= 0.2 ? "bg-amber-600" : "bg-red-600"}`}><p className="text-xs font-black uppercase tracking-wide opacity-80">Route margin</p><p className="mt-1 text-4xl font-black">{(routeMargin * 100).toFixed(1)}%</p><p className="mt-2 text-sm opacity-90">This is an operating estimate, not an accounting statement. Replace every input with your real route-day data.</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-2">
        <article className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tool 3</p>
          <h2 className="mt-2 text-2xl font-black text-[#123b24]">Three-message estimate recovery sequence</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">{Object.entries({ customer: "Customer", pest: "Pest issue", recommendation: "Recommendation", booking: "Easy booking choice" }).map(([key, label]) => <label key={key} className="text-xs font-bold text-slate-600">{label}<Input value={estimate[key as keyof typeof estimate]} onChange={(event) => setEstimate({ ...estimate, [key]: event.target.value })} className="mt-1" /></label>)}</div>
          <div className="mt-5 space-y-3 text-sm leading-6">
            <div className="rounded-xl bg-slate-50 p-4"><b>Message 1 - recommendation:</b><br />Hi {estimate.customer}, based on the {estimate.pest}, the next step I recommend is the {estimate.recommendation}. I can walk you through what it covers before you decide.</div>
            <div className="rounded-xl bg-slate-50 p-4"><b>Message 2 - uncertainty:</b><br />The main reason I recommended the {estimate.recommendation} is to address the source of the {estimate.pest}, not only the activity you can see today. What would you need clarified before moving forward?</div>
            <div className="rounded-xl bg-slate-50 p-4"><b>Message 3 - booking:</b><br />I can make the next step easy: would {estimate.booking} work better? If the timing is not right, tell me and I’ll close the loop instead of filling your inbox.</div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tool 4</p>
          <h2 className="mt-2 text-2xl font-black text-[#123b24]">Cancellation save ladder</h2>
          <div className="mt-5 flex flex-wrap gap-2 print:hidden">{Object.entries({ price: "Price", results: "Results", communication: "Communication", moving: "Moving" }).map(([key, label]) => <button key={key} onClick={() => setCancelReason(key)} className={`rounded-full px-4 py-2 text-sm font-black ${cancelReason === key ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white"}`}>{label}</button>)}</div>
          <ol className="mt-6 space-y-4">{savePlans[cancelReason].map((step, index) => <li key={step} className="flex gap-3 rounded-xl bg-slate-50 p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">{index + 1}</span><span className="text-sm font-semibold leading-6 text-slate-700">{step}</span></li>)}</ol>
        </article>
      </section>

      <section className="bg-[#123b24] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-400">Tool 5</p>
          <h2 className="mt-2 text-3xl font-black">Your Monday recovery plan</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">{lowest.map((item, index) => <div key={item.name} className="rounded-2xl border border-white/10 bg-white/5 p-5"><div className="flex items-center justify-between"><span className="text-sm font-black text-emerald-400">Priority {index + 1}</span><span className="text-sm font-bold">{item.score}/{item.max}</span></div><h3 className="mt-3 text-xl font-black">{item.name}</h3><p className="mt-2 text-sm leading-6 text-white/70">Pull 10 recent records. Mark every missing owner, date, or next action. Fix the smallest complete handoff and review its exceptions next Monday.</p></div>)}</div>
          <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden"><Button asChild size="lg" className="bg-emerald-500 font-black hover:bg-emerald-400"><a href="https://app.pestflow.org/login">Connect the workflow in PestFlow <ArrowRight className="ml-2 h-4 w-4" /></a></Button><Button onClick={() => window.print()} size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><Printer className="mr-2 h-4 w-4" />Print this plan</Button></div>
        </div>
      </section>
    </main>
  );
}
