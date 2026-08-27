import { isIP } from "node:net";
import type { IncomingHttpHeaders } from "node:http";
import type { RequestHandler } from "express";

const REQUEST_IP_HEADERS = [
  "cf-connecting-ip",
  "true-client-ip",
  "x-real-ip",
  "fly-client-ip",
] as const;

export const BLOCKED_BROWSER_COOKIE = "__Secure-pestflow-denied";
const BLOCKED_BROWSER_COOKIE_VALUE = "1";
const BLOCKED_BROWSER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 10;

export function hasBlockedBrowserMarker(cookieHeader: unknown): boolean {
  if (typeof cookieHeader !== "string") return false;
  return cookieHeader.split(";").some((entry) => {
    const [name, ...valueParts] = entry.trim().split("=");
    return name === BLOCKED_BROWSER_COOKIE
      && valueParts.join("=") === BLOCKED_BROWSER_COOKIE_VALUE;
  });
}

export function blockedBrowserCookie(): string {
  return [
    `${BLOCKED_BROWSER_COOKIE}=${BLOCKED_BROWSER_COOKIE_VALUE}`,
    "Domain=.pestflow.org",
    "Path=/",
    `Max-Age=${BLOCKED_BROWSER_COOKIE_MAX_AGE}`,
    "Secure",
    "HttpOnly",
    "SameSite=Lax",
  ].join("; ");
}

export function normalizeIp(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let candidate = value.trim().replace(/^"|"$/g, "");
  if (!candidate) return null;

  const bracketed = candidate.match(/^\[([^\]]+)](?::\d+)?$/);
  if (bracketed) {
    candidate = bracketed[1];
  } else if (/^(?:\d{1,3}\.){3}\d{1,3}:\d+$/.test(candidate)) {
    candidate = candidate.slice(0, candidate.lastIndexOf(":"));
  }

  const mappedIpv4 = candidate.match(/^::ffff:((?:\d{1,3}\.){3}\d{1,3})$/i);
  if (mappedIpv4) candidate = mappedIpv4[1];

  const family = isIP(candidate);
  if (family === 4) return candidate;
  if (family !== 6) return null;

  try {
    const hostname = new URL(`http://[${candidate}]/`).hostname;
    return hostname.slice(1, -1).toLowerCase();
  } catch {
    return candidate.toLowerCase();
  }
}

export function parseBlockedIps(value: unknown): Set<string> {
  if (typeof value !== "string") return new Set();
  return new Set(
    value
      .split(",")
      .map((entry) => normalizeIp(entry))
      .filter((entry): entry is string => entry !== null),
  );
}

function headerValues(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function requestIpCandidates(headers: IncomingHttpHeaders): string[] {
  const forwarded = headerValues(headers["x-forwarded-for"])
    .flatMap((value) => value.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
  const direct = REQUEST_IP_HEADERS.flatMap((name) => headerValues(headers[name]));
  return [...forwarded, ...direct];
}

export function blockedIpForHeaders(
  headers: IncomingHttpHeaders,
  configuredIps: unknown = process.env.PESTFLOW_BLOCKED_IPS,
): string | null {
  const blocked = parseBlockedIps(configuredIps);
  if (blocked.size === 0) return null;

  for (const candidate of requestIpCandidates(headers)) {
    const normalized = normalizeIp(candidate);
    if (normalized && blocked.has(normalized)) return normalized;
  }
  return null;
}

export function createBlockedIpMiddleware(
  configuredIps: unknown = process.env.PESTFLOW_BLOCKED_IPS,
): RequestHandler {
  const blocked = parseBlockedIps(configuredIps);

  return (req, res, next) => {
    if (hasBlockedBrowserMarker(req.headers.cookie)) {
      console.warn(`[blocked-browser] rejected ${req.method} ${req.path}`);
      res.setHeader("Cache-Control", "no-store");
      return res.status(403).type("text/plain").send("Forbidden");
    }

    if (blocked.size === 0) return next();

    const matchedIp = blockedIpForHeaders(req.headers, Array.from(blocked).join(","));
    if (!matchedIp) return next();

    console.warn(`[blocked-ip] rejected ${req.method} ${req.path} from ${matchedIp}`);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Set-Cookie", blockedBrowserCookie());
    res.status(403).type("text/plain").send("Forbidden");
  };
}
