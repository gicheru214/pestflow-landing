import { useEffect, useMemo, useState } from "react";
import { Beaker, ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { ConceptPage } from "@/components/conversion-lab/concept-page";
import {
  CONCEPTS,
  DEFAULT_CONCEPT_ID,
  getConcept,
  withCampaignIntent,
  type CampaignIntent,
  type ConceptId,
} from "@/components/conversion-lab/concepts";

const CAMPAIGN_INTENTS: Array<{ id: CampaignIntent; label: string }> = [
  { id: "default", label: "Default" },
  { id: "routes", label: "Routes ad" },
  { id: "billing", label: "Billing ad" },
  { id: "field", label: "Field ad" },
  { id: "switching", label: "Switching ad" },
];

export default function ConversionLab() {
  const initial = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return getConcept(params.get("concept") || DEFAULT_CONCEPT_ID).id;
  }, []);
  const initialIntent = useMemo<CampaignIntent>(() => {
    const value = new URLSearchParams(window.location.search).get("intent") as CampaignIntent | null;
    return CAMPAIGN_INTENTS.some((item) => item.id === value) ? value! : "default";
  }, []);
  const [selectedId, setSelectedId] = useState<ConceptId>(initial);
  const [intent, setIntent] = useState<CampaignIntent>(initialIntent);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selected = withCampaignIntent(getConcept(selectedId), intent);

  useEffect(() => {
    document.title = `${selected.name} · PestFlow Conversion Lab`;
    const params = new URLSearchParams(window.location.search);
    params.set("concept", selected.id);
    params.set("internal", "1");
    if (intent === "default") params.delete("intent");
    else params.set("intent", intent);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [selected.id, intent]);

  const choose = (id: ConceptId) => {
    setSelectedId(id);
    setDrawerOpen(false);
  };

  return (
    <div>
      <div className="sticky top-0 z-[300] border-b border-white/10 bg-[#0b100d] text-white shadow-xl">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center gap-3 px-3 sm:px-5">
          <button onClick={() => setDrawerOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 lg:hidden" aria-label="Open concept list">{drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
          <div className="flex min-w-0 items-center gap-3 border-r border-white/10 pr-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#4c8f2f]"><Beaker className="h-4 w-4" /></span>
            <div className="min-w-0"><p className="truncate text-xs font-black">PestFlow Conversion Lab</p><p className="truncate text-[10px] text-white/35">10 staging-only concepts · analytics disabled</p></div>
          </div>
          <div className="hidden flex-1 items-center gap-1 overflow-x-auto py-2 lg:flex">
            {CONCEPTS.map((concept, index) => (
              <button key={concept.id} onClick={() => choose(concept.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-bold transition ${selectedId === concept.id ? "bg-white text-[#101713]" : "text-white/45 hover:bg-white/5 hover:text-white"}`}>{index + 1}. {concept.name}</button>
            ))}
          </div>
          <div className="ml-auto hidden max-w-[320px] items-center gap-2 text-right xl:flex"><div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Current thesis</p><p className="line-clamp-1 text-[11px] text-white/40">{selected.thesis}</p></div><ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/25" /></div>
        </div>

        {drawerOpen && (
          <div className="border-t border-white/10 bg-[#0b100d] p-3 lg:hidden">
            <div className="grid gap-1 sm:grid-cols-2">
              {CONCEPTS.map((concept, index) => <button key={concept.id} onClick={() => choose(concept.id)} className={`flex items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold ${selectedId === concept.id ? "bg-white text-[#101713]" : "bg-white/[0.04] text-white/60"}`}><span>{index + 1}. {concept.name}</span><ChevronDown className="h-3.5 w-3.5 -rotate-90" /></button>)}
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-amber-300/30 bg-amber-50 px-4 py-2.5 text-center text-[11px] font-semibold text-amber-900">
        Staging simulator. Forms and calendar slots are intentionally non-submitting; use them to evaluate hierarchy, copy, and flow.
      </div>

      {selectedId === DEFAULT_CONCEPT_ID && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-black/5 bg-white px-4 py-2.5">
          <span className="mr-1 text-[10px] font-black uppercase tracking-[0.16em] text-black/35">Facebook message match</span>
          {CAMPAIGN_INTENTS.map((item) => (
            <button
              key={item.id}
              onClick={() => setIntent(item.id)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition ${intent === item.id ? "bg-[#182019] text-white" : "bg-black/[0.045] text-black/45 hover:bg-black/[0.08]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <ConceptPage concept={selected} />
    </div>
  );
}
