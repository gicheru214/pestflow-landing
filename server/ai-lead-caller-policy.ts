const VALID_ZONES = new Set([
  "America/New_York", "America/Detroit", "America/Kentucky/Louisville", "America/Indiana/Indianapolis",
  "America/Chicago", "America/Menominee", "America/Denver", "America/Phoenix",
  "America/Los_Angeles", "America/Anchorage", "America/Juneau", "Pacific/Honolulu",
]);

export function usPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(national) ? `+1${national}` : null;
}

export function validZone(value: unknown): string | null {
  return typeof value === "string" && VALID_ZONES.has(value) ? value : null;
}

export function withinCallHours(zone: string, at: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone, hour: "numeric", hourCycle: "h23", weekday: "short",
  }).formatToParts(at);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const day = parts.find((p) => p.type === "weekday")?.value;
  return Number.isFinite(hour) && hour >= 9 && hour < 18 && day !== "Sat" && day !== "Sun";
}

export function isRetryableNoAnswer(reason: string): boolean {
  return reason === "customer-did-not-answer" || reason === "customer-busy";
}
