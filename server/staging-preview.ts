const STAGING_EXPERIMENT_HOST =
  "pestflow-landing-conversion-staging.up.railway.app";
const STAGING_EXPERIMENT_MARKER = "staging-experiment";

function normalizeHost(value: string | undefined): string {
  return (value || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

export function isStagingExperimentPreviewRequest(
  host: string | undefined,
  marker: string | undefined,
): boolean {
  const normalizedHost = normalizeHost(host);
  return marker === STAGING_EXPERIMENT_MARKER
    && (
      normalizedHost === STAGING_EXPERIMENT_HOST
      || normalizedHost === "localhost"
      || normalizedHost === "127.0.0.1"
    );
}
