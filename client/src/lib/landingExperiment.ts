export const LANDING_EXPERIMENT_KEY =
  "pestflow-landing-playbook-gate-staging-v1";

export type LandingExperimentVariant = "control" | "no_playbook";

const STAGING_HOST =
  "pestflow-landing-conversion-staging.up.railway.app";

export function isLandingExperimentStagingHost(
  hostname = window.location.hostname,
): boolean {
  return hostname === STAGING_HOST
    || hostname === "localhost"
    || hostname === "127.0.0.1";
}

export function isLandingExperimentVariant(
  value: unknown,
): value is LandingExperimentVariant {
  return value === "control" || value === "no_playbook";
}

export function normalizeLandingExperimentVariant(
  value: unknown,
): LandingExperimentVariant | null {
  if (value === "test") return "no_playbook";
  return isLandingExperimentVariant(value) ? value : null;
}

export function stagingPreviewHeaders(): Record<string, string> {
  return isLandingExperimentStagingHost()
    ? { "X-PestFlow-Internal-Preview": "staging-experiment" }
    : {};
}
