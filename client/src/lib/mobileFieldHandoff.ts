export const MOBILE_FIELD_URL =
  "https://app.pestflow.org/mobile-v2-field.html";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export interface MobileFieldLead {
  source: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  routes?: string;
  metaEventId?: string;
  search?: string;
}

export function buildMobileFieldSignupUrl(lead: MobileFieldLead): string {
  const url = new URL(MOBILE_FIELD_URL);
  url.searchParams.set("screen", "auth-signup");
  url.searchParams.set("authfresh", "true");
  url.searchParams.set("source", lead.source);

  const values = {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    routes: lead.routes,
    meta_event_id: lead.metaEventId,
  };
  Object.entries(values).forEach(([key, value]) => {
    const normalized = value?.trim();
    if (normalized) url.searchParams.set(key, normalized);
  });

  const current = new URLSearchParams(lead.search || "");
  ATTRIBUTION_KEYS.forEach((key) => {
    const value = current.get(key)?.trim();
    if (value) url.searchParams.set(key, value);
  });

  return url.toString();
}
