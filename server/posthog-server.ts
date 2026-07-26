const POSTHOG_PROJECT_TOKEN =
  process.env.POSTHOG_PROJECT_TOKEN
  || "phc_zncWU9ES8JdmX64BtANCEcfv3h7xYoTkPoWCFcZbfvsF";
const POSTHOG_CAPTURE_URL =
  process.env.POSTHOG_CAPTURE_URL
  || "https://us.i.posthog.com/i/v0/e/";
const REQUEST_TIMEOUT_MS = 3_000;

export async function captureProspectLifecycleEvent(
  event: string,
  prospectKeyHash: string,
  properties: Record<string, string | number | boolean | null | undefined>,
  timestamp = new Date(),
): Promise<boolean> {
  if (!POSTHOG_PROJECT_TOKEN) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(POSTHOG_CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_PROJECT_TOKEN,
        event,
        distinct_id: `prospect:${prospectKeyHash}`,
        timestamp: timestamp.toISOString(),
        properties: {
          ...properties,
          prospect_key_hash: prospectKeyHash,
          source_of_truth: "prospect_ledger",
          $process_person_profile: false,
        },
      }),
      signal: controller.signal,
    });
    return response.ok;
  } catch (error) {
    console.warn(
      "[posthog] prospect lifecycle capture failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
