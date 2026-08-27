import assert from "node:assert/strict";
import test from "node:test";
import {
  BLOCKED_BROWSER_COOKIE,
  blockedBrowserCookie,
  blockedIpForHeaders,
  hasBlockedBrowserMarker,
  normalizeIp,
  parseBlockedIps,
} from "./blocked-ip";

test("normalizes IPv4, mapped IPv4, and IPv6 values", () => {
  assert.equal(normalizeIp("172.56.190.98:443"), "172.56.190.98");
  assert.equal(normalizeIp("::ffff:172.56.190.98"), "172.56.190.98");
  assert.equal(normalizeIp("[2607:fb90:0:0:0:0:0:1]:443"), "2607:fb90::1");
});

test("parses a comma-separated exact-address deny list", () => {
  assert.deepEqual(
    [...parseBlockedIps("172.56.190.98, 2607:fb90:0:0:0:0:0:1")],
    ["172.56.190.98", "2607:fb90::1"],
  );
});

test("blocks matching IPv4 and IPv6 request headers", () => {
  assert.equal(
    blockedIpForHeaders(
      { "x-forwarded-for": "2607:fb90:4208:8eaf:387c:7f59:3743:3ffe, 10.0.0.1" },
      "172.56.190.98,2607:fb90:4208:8eaf:387c:7f59:3743:3ffe",
    ),
    "2607:fb90:4208:8eaf:387c:7f59:3743:3ffe",
  );
  assert.equal(
    blockedIpForHeaders({ "x-real-ip": "::ffff:96.80.159.210" }, "96.80.159.210"),
    "96.80.159.210",
  );
});

test("allows unlisted and missing request addresses", () => {
  assert.equal(
    blockedIpForHeaders({ "x-forwarded-for": "203.0.113.9" }, "172.56.190.98"),
    null,
  );
  assert.equal(blockedIpForHeaders({}, "172.56.190.98"), null);
});

test("recognizes the cross-subdomain blocked-browser marker", () => {
  assert.equal(
    hasBlockedBrowserMarker(`other=ok; ${BLOCKED_BROWSER_COOKIE}=1`),
    true,
  );
  assert.equal(hasBlockedBrowserMarker(`${BLOCKED_BROWSER_COOKIE}=0`), false);
  assert.match(blockedBrowserCookie(), /Domain=\.pestflow\.org/);
  assert.match(blockedBrowserCookie(), /HttpOnly/);
  assert.match(blockedBrowserCookie(), /Secure/);
});
