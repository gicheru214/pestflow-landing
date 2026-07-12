import { useEffect, useMemo } from "react";
import { ConceptPage } from "@/components/conversion-lab/concept-page";
import {
  DEFAULT_CONCEPT_ID,
  getConcept,
  withCampaignIntent,
  type CampaignIntent,
} from "@/components/conversion-lab/concepts";

const VALID_INTENTS: CampaignIntent[] = ["default", "routes", "billing", "field", "switching"];

export default function ConversionPreview() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const isProductionHost = ["pestflow.org", "www.pestflow.org"].includes(window.location.hostname);
  const isAuthorizedPreview = !isProductionHost || params.get("internal") === "1";
  const requestedIntent = params.get("intent") as CampaignIntent | null;
  const intent = requestedIntent && VALID_INTENTS.includes(requestedIntent) ? requestedIntent : "default";
  const concept = withCampaignIntent(getConcept(DEFAULT_CONCEPT_ID), intent);

  useEffect(() => {
    document.title = `${concept.name} · PestFlow Staging Preview`;
  }, [concept.name]);

  if (!isAuthorizedPreview) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faf7] px-6 text-center text-[#152019]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-black/35">Preview unavailable</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">This staging concept is not a production route.</h1>
        </div>
      </main>
    );
  }

  return (
    <div>
      <div className="pointer-events-none fixed bottom-3 right-3 z-[400] rounded-full border border-white/10 bg-[#0b100d]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white/70 shadow-lg backdrop-blur">
        Staging preview · no submissions
      </div>
      <ConceptPage concept={concept} />
    </div>
  );
}
