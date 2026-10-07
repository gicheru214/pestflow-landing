const SUCCESS_KEY = "pestflow_referral_partner_success";
const FIRED_PREFIX = "pestflow_referral_partner_event_fired:";
const LEAD_FIRED_PREFIX = "pestflow_referral_partner_lead_fired:";
const MAX_AGE_MS = 30 * 60 * 1000;
const APPLICATION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i;

type CompletedApplication = {
  applicationId: string;
  createdAt: number;
};

export function rememberReferralPartnerApplication(applicationId: string): boolean {
  if (!APPLICATION_ID_PATTERN.test(applicationId)) return false;
  try {
    sessionStorage.setItem(SUCCESS_KEY, JSON.stringify({ applicationId, createdAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function completedReferralPartnerApplication(): CompletedApplication | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SUCCESS_KEY) || "null") as CompletedApplication | null;
    if (!saved || !APPLICATION_ID_PATTERN.test(saved.applicationId)) return null;
    if (!Number.isFinite(saved.createdAt) || Date.now() - saved.createdAt > MAX_AGE_MS) return null;
    return saved;
  } catch {
    return null;
  }
}

// Both Meta events only fire after the application endpoint confirms a saved record.
export function fireReferralPartnerApplicationOnce(): boolean {
  const completed = completedReferralPartnerApplication();
  if (!completed) return false;

  const customFiredKey = `${FIRED_PREFIX}${completed.applicationId}`;
  const leadFiredKey = `${LEAD_FIRED_PREFIX}${completed.applicationId}`;
  let customFired = false;
  let leadFired = false;
  try {
    customFired = sessionStorage.getItem(customFiredKey) === "1";
    leadFired = sessionStorage.getItem(leadFiredKey) === "1";
  } catch {
    // A storage restriction should not hide a completed application.
  }
  if (customFired && leadFired) return true;

  if (typeof window.fbq !== "function") return false;
  if (!customFired) {
    window.fbq(
      "trackCustom",
      "ReferralPartnerApplication",
      { application_type: "paid_referral_partner" },
      { eventID: `pestflow-referral-${completed.applicationId}` },
    );
  }
  if (!leadFired) {
    window.fbq("track", "Lead", {}, { eventID: `pestflow-referral-lead-${completed.applicationId}` });
  }
  try {
    if (!customFired) sessionStorage.setItem(customFiredKey, "1");
    if (!leadFired) sessionStorage.setItem(leadFiredKey, "1");
  } catch {
    // Meta can still receive the event when browser storage is restricted.
  }
  return true;
}
