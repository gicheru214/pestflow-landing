import { useEffect } from "react";
import { LEAD_MAGNET_IDS, isLeadMagnetId } from "@/lead-magnets/config";
import { analytics } from "@/lib/analytics";

function selectVariant(pool: string[]) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return pool[array[0] % pool.length];
}

export default function LeadMagnetAssignment() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPool = (params.get("pool") || "").split(",").map((value) => value.trim()).filter(isLeadMagnetId);
    const pool = requestedPool.length >= 2 ? requestedPool : [...LEAD_MAGNET_IDS];
    const experiment = params.get("experiment") || "all-five";
    const storageKey = `pestflow_lm_assignment_${experiment}_${pool.join("_")}`;
    if (params.get("reset") === "1") localStorage.removeItem(storageKey);

    const forced = params.get("variant");
    const stored = localStorage.getItem(storageKey);
    const forcedVariant = forced && isLeadMagnetId(forced) && pool.includes(forced) ? forced : null;
    const storedVariant = stored && isLeadMagnetId(stored) && pool.includes(stored) ? stored : null;
    const selected = forcedVariant || storedVariant || selectVariant(pool);
    localStorage.setItem(storageKey, selected);
    params.delete("variant");
    params.delete("pool");
    params.delete("reset");
    params.set("experiment", experiment);
    params.set("lm_assignment", selected);
    analytics.track("Lead Magnet Variant Assigned", { variant: selected, experiment, pool_size: pool.length });
    window.location.replace(`/experiments/lead-magnets/${selected}?${params.toString()}`);
  }, []);

  return <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white"><div><span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" /><p className="mt-5 text-sm font-black">Assigning a PestFlow experiment…</p></div></main>;
}
