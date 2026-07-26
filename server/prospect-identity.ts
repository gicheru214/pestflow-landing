import crypto from "crypto";

export interface ProspectSubmissionLike {
  id: string;
  submittedAt: Date | string | null;
  type: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  routeAnswers?: unknown;
  quizAnswers?: unknown;
}

export interface ProspectGroup<T extends ProspectSubmissionLike> {
  canonicalKey: string;
  prospectKeyHash: string;
  rows: T[];
  first: T;
  latest: T;
  best: T;
}

function normalized(value: string | null | undefined): string {
  return value?.trim().normalize("NFKC").toLowerCase() ?? "";
}

export function isTestProspect(row: ProspectSubmissionLike): boolean {
  const name = normalized(`${row.firstName ?? ""} ${row.lastName ?? ""}`);
  const email = normalized(row.email);

  if (/\b(qa\s*test|diag(nostic)?|posthog|smoke\s*test|test\s*user|loadtest|automation|tester)\b/.test(name)) {
    return true;
  }
  if (name === "diag" || name === "test" || name === "qa") return true;
  if (/\btrevor\s+gicheru\b/.test(name)) return true;
  if (/^so\s+let/.test(name)) return true;
  if (name.split(/\s+/).filter(Boolean).length > 5) return true;
  if (email.includes("mailinator.com")) return true;
  if (email.includes("@example.com") || email.includes("@test.com")) return true;
  if (/^(qa[-_]?test|posthog|diag(nostic)?|smoke[-_]?test|automation|loadtest)/.test(email)) {
    return true;
  }
  return /^test\d*@/.test(email);
}

// Keep this identical to the admin dashboard's prospect grouping. That is the
// user-visible contract: every key displayed as a prospect gets one ledger row.
export function adminProspectCanonicalKey(
  row: ProspectSubmissionLike,
): string {
  const fullName = normalized(`${row.firstName ?? ""} ${row.lastName ?? ""}`);
  const looksLikeRealName = fullName.includes(" ") && fullName.length >= 4;
  return (
    looksLikeRealName
      ? fullName
      : normalized(row.email) || normalized(row.phone) || fullName || row.id
  );
}

export function hashProspectKey(canonicalKey: string): string {
  return crypto
    .createHash("sha256")
    .update(canonicalKey.normalize("NFKC").toLowerCase())
    .digest("hex");
}

export function deterministicProspectEventId(
  prospectKeyHash: string,
): string {
  return `pestflow-prospect-${prospectKeyHash.slice(0, 48)}`;
}

function submittedMillis(row: ProspectSubmissionLike): number {
  const value = row.submittedAt ? new Date(row.submittedAt).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
}

export function buildProspectGroups<T extends ProspectSubmissionLike>(
  rows: T[],
): ProspectGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const row of rows) {
    if (isTestProspect(row)) continue;
    const key = adminProspectCanonicalKey(row);
    const group = buckets.get(key) ?? [];
    group.push(row);
    buckets.set(key, group);
  }

  return Array.from(buckets, ([canonicalKey, groupRows]) => {
    const sorted = [...groupRows].sort(
      (a, b) => submittedMillis(a) - submittedMillis(b),
    );
    const latestFirst = [...sorted].reverse();
    const best =
      latestFirst.find((row) => Boolean(row.quizAnswers))
      ?? latestFirst.find((row) => Boolean(row.routeAnswers))
      ?? latestFirst[0];
    return {
      canonicalKey,
      prospectKeyHash: hashProspectKey(canonicalKey),
      rows: groupRows,
      first: sorted[0],
      latest: sorted[sorted.length - 1],
      best,
    };
  });
}

export function latestNonEmpty<T extends ProspectSubmissionLike>(
  rows: T[],
  field: "firstName" | "lastName" | "email" | "phone",
): string | null {
  const sorted = [...rows].sort(
    (a, b) => submittedMillis(b) - submittedMillis(a),
  );
  for (const row of sorted) {
    const value = row[field]?.trim();
    if (value) return value;
  }
  return null;
}
