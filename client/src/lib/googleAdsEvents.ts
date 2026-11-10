const CALENDLY_INVITEE_URI =
  /^https:\/\/api\.calendly\.com\/scheduled_events\/[a-z0-9_-]+\/invitees\/([a-z0-9_-]+)$/i;
const DEMO_BOOKED_CONVERSION = "AW-17886342638/xJLoCKGf4rUdEO7b79BC";
const recordedDemoIds = new Set<string>();

declare global {
  interface Window {
    gtag?: (
      command: "event",
      event: "conversion",
      parameters: { send_to: string; transaction_id: string },
    ) => void;
  }
}

export function trackCalendlyDemoBooking(inviteeUri: unknown) {
  if (typeof inviteeUri !== "string" || typeof window.gtag !== "function") return;

  const inviteeId = CALENDLY_INVITEE_URI.exec(inviteeUri)?.[1];
  if (!inviteeId) return;

  const transactionId = `pf-demo-${inviteeId}`;
  if (recordedDemoIds.has(transactionId)) return;

  window.gtag("event", "conversion", {
    send_to: DEMO_BOOKED_CONVERSION,
    transaction_id: transactionId,
  });
  recordedDemoIds.add(transactionId);
}
