import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";
import {
  isLandingExperimentStagingHost,
  isLandingExperimentVariant,
  LANDING_EXPERIMENT_KEY,
  type LandingExperimentVariant,
} from "@/lib/landingExperiment";
import { DirectIntentPopup } from "./direct-intent-popup";
import { PlaybookActivationPopup } from "./playbook-activation-popup";

type Assignment = {
  ready: boolean;
  source:
    | "production_failsafe"
    | "query_override"
    | "posthog"
    | "flag_off"
    | "timeout";
  variant: LandingExperimentVariant;
};

function initialAssignment(): Assignment {
  if (!isLandingExperimentStagingHost()) {
    return {
      ready: true,
      source: "production_failsafe",
      variant: "control",
    };
  }
  return { ready: false, source: "timeout", variant: "control" };
}

function useLandingExperimentAssignment(): Assignment {
  const [assignment, setAssignment] = useState<Assignment>(initialAssignment);

  useEffect(() => {
    if (!isLandingExperimentStagingHost()) return;

    const params = new URLSearchParams(window.location.search);
    const override = params.get("ab_variant");
    let settled = false;

    const finish = (
      variant: LandingExperimentVariant,
      source: Assignment["source"],
    ) => {
      if (settled) return;
      settled = true;
      setAssignment({ ready: true, source, variant });
      analytics.track("Landing Funnel Experiment Exposed", {
        experiment: LANDING_EXPERIMENT_KEY,
        variant,
        assignment_source: source,
        staging_only: true,
      });
    };

    if (isLandingExperimentVariant(override)) {
      finish(override, "query_override");
      return;
    }

    const resolveFlag = () => {
      const value = window.posthog?.getFeatureFlag?.(LANDING_EXPERIMENT_KEY);
      if (isLandingExperimentVariant(value)) {
        finish(value, "posthog");
      } else if (value === false) {
        finish("control", "flag_off");
      }
    };

    const unsubscribe = window.posthog?.onFeatureFlags?.(resolveFlag);
    resolveFlag();
    const fallbackTimer = window.setTimeout(
      () => finish("control", "timeout"),
      1200,
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return assignment;
}

export function LandingFunnelExperiment() {
  const assignment = useLandingExperimentAssignment();

  if (!assignment.ready) return null;
  if (assignment.variant === "no_playbook") {
    return (
      <DirectIntentPopup
        experimentKey={LANDING_EXPERIMENT_KEY}
        variant={assignment.variant}
      />
    );
  }
  return <PlaybookActivationPopup key={window.location.search} />;
}
