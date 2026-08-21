import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { analytics, EVENTS } from "@/lib/analytics";
import {
  buildOnboardingHandoffUrl,
  isMobileOnboardingBrowser,
} from "@/lib/onboardingHandoff";

// Landing-side /onboarding is now a thin handoff to app.pestflow.org.
// The old Replit-era multi-step profile form (firstName/lastName/companyName/
// technicians/address/logo/etc.) was over-collection on the wrong codebase.
// Phones continue into field onboarding. Desktop browsers go directly to the
// shared desktop-safe signup page and never mount the phone shell.

export default function Onboarding() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const popupData = (() => {
      try { return JSON.parse(localStorage.getItem("pestflow_popup_data") || "{}"); } catch { return {}; }
    })();

    const carry: Record<string, string> = {};
    const routesRaw = parseInt(popupData.routeSize || urlParams.get("routes") || "1", 10);
    const routes = isNaN(routesRaw) || routesRaw < 1 ? 1 : Math.min(routesRaw, 74);
    carry.routes = String(routes);

    ["email", "firstName", "lastName", "phone", "utm_source", "utm_campaign", "utm_content"].forEach((k) => {
      const v = urlParams.get(k) || popupData[k];
      if (v) carry[k] = String(v);
    });

    analytics.track(EVENTS.ONBOARDING.STEP_1_VIEW, { handoff: true });

    window.location.replace(buildOnboardingHandoffUrl(
      isMobileOnboardingBrowser(),
      carry,
    ));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <div>
          <h1 className="text-xl font-bold text-slate-900">Setting up your account…</h1>
          <p className="text-sm text-slate-500 mt-1">Taking you into PestFlow.</p>
        </div>
      </div>
    </div>
  );
}
