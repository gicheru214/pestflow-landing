export const PESTFLOW_CALENDLY_URL =
  "https://calendly.com/tgicheru21/pestflow-set-up-call";

export type CalendlyPrefill = {
  name?: string;
  email?: string;
  phone?: string;
  selectedDate?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
};

function phoneDigits(value = "") {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1")
    ? digits.slice(1)
    : digits;
}

export function buildPestFlowCalendlyUrl({
  name = "",
  email = "",
  phone = "",
  selectedDate,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
}: CalendlyPrefill) {
  const url = new URL(PESTFLOW_CALENDLY_URL);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("background_color", "ffffff");
  url.searchParams.set("text_color", "0f172a");
  url.searchParams.set("primary_color", "42a824");

  if (selectedDate) {
    url.searchParams.set("month", selectedDate.slice(0, 7));
    url.searchParams.set("date", selectedDate);
  }
  if (name.trim()) url.searchParams.set("name", name.trim());
  if (email.trim()) url.searchParams.set("email", email.trim().toLowerCase());

  // This event uses a phone-call location, so Calendly's `location`
  // prefill is the invitee phone field. SMS reminder fields cannot be
  // prefilled, and should remain an explicit invitee choice.
  const normalizedPhone = phoneDigits(phone);
  if (normalizedPhone) url.searchParams.set("location", normalizedPhone);

  url.searchParams.set("utm_source", utmSource || "pestflow_landing");
  url.searchParams.set("utm_medium", utmMedium || "website");
  url.searchParams.set("utm_campaign", utmCampaign || "playbook-workflow-v2");
  url.searchParams.set("utm_content", utmContent || "playbook_calendar");
  return url.toString();
}

export function buildSoroArticleCalendlyUrl(articleSlug: string) {
  return buildPestFlowCalendlyUrl({
    utmSource: "pestflow_blog",
    utmMedium: "website",
    utmCampaign: "soro_article_demo",
    utmContent: articleSlug.trim() || "unknown_article",
  });
}
