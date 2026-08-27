import type { RequestHandler } from "express";

export type BlockedSubmissionIdentity = {
  type: "email" | "phone";
  normalizedValue: string;
};

export function normalizeBlockedEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeBlockedPhone(value: unknown): string {
  const digits = typeof value === "string"
    ? value.replace(/\D/g, "")
    : String(value ?? "").replace(/\D/g, "");
  return digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
}

function csvSet(value: unknown, normalize: (entry: unknown) => string): Set<string> {
  if (typeof value !== "string") return new Set();
  return new Set(value.split(",").map(normalize).filter(Boolean));
}

export function blockedSubmissionIdentity(
  body: unknown,
  configuredEmails: unknown = process.env.PESTFLOW_BLOCKED_EMAILS,
  configuredPhones: unknown = process.env.PESTFLOW_BLOCKED_PHONES,
): BlockedSubmissionIdentity | null {
  if (!body || typeof body !== "object") return null;
  const submission = body as Record<string, unknown>;
  const email = normalizeBlockedEmail(submission.email);
  const phone = normalizeBlockedPhone(submission.phone);
  const emails = csvSet(configuredEmails, normalizeBlockedEmail);
  const phones = csvSet(configuredPhones, normalizeBlockedPhone);

  if (email && emails.has(email)) {
    return { type: "email", normalizedValue: email };
  }
  if (phone && phones.has(phone)) {
    return { type: "phone", normalizedValue: phone };
  }
  return null;
}

export function createBlockedSubmissionIdentityMiddleware(
  configuredEmails: unknown = process.env.PESTFLOW_BLOCKED_EMAILS,
  configuredPhones: unknown = process.env.PESTFLOW_BLOCKED_PHONES,
): RequestHandler {
  return (req, res, next) => {
    if (req.method !== "POST") return next();
    const match = blockedSubmissionIdentity(req.body, configuredEmails, configuredPhones);
    if (!match) return next();

    console.warn(`[blocked-identity] rejected ${req.method} ${req.path} by ${match.type}`);
    res.setHeader("Cache-Control", "no-store");
    return res.status(403).json({ error: "Forbidden" });
  };
}
