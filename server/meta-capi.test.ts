import assert from "node:assert/strict";
import test from "node:test";

process.env.META_PIXEL_ID = "test-pixel";
process.env.META_CAPI_ACCESS_TOKEN = "test-token";
process.env.META_GRAPH_API_VERSION = "v24.0";

const { isQualifiedOwnerLeadSubmission, sendLeadEvent } = await import("./meta-capi");

test("only the regular owner offer is a qualified Meta Lead", () => {
  assert.equal(isQualifiedOwnerLeadSubmission({
    type: "popup_partial",
    reason: "accept_offer_signup_success",
    metaEventId: "pestflow-lead-owner-123",
  }), true);
  assert.equal(isQualifiedOwnerLeadSubmission({
    type: "tech_lead",
    reason: "accept_offer_signup_success",
    metaEventId: "pestflow-lead-tech-123",
  }), false);
});

test("qualified Lead uses the browser event ID and hashed match fields", async () => {
  const originalFetch = globalThis.fetch;
  let request: { url: string; init?: RequestInit } | undefined;
  globalThis.fetch = async (input, init) => {
    request = { url: String(input), init };
    return new Response(JSON.stringify({ events_received: 1 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const sent = await sendLeadEvent({
      eventId: "pestflow-lead-browser-123",
      eventSourceUrl: "https://pestflow.org/?fbclid=test",
      leadSource: "owner-offer",
      userData: {
        email: "Qualified@Example.com ",
        phone: "(555) 123-4567",
        firstName: "Ada",
        lastName: "Lovelace",
        clientIpAddress: "203.0.113.5",
        clientUserAgent: "test-agent",
        fbc: "fb.1.123.test",
        fbp: "fb.1.123.browser",
      },
    });

    assert.equal(sent, true);
    assert.equal(request?.url, "https://graph.facebook.com/v24.0/test-pixel/events");
    assert.equal(new Headers(request?.init?.headers).get("authorization"), "Bearer test-token");

    const payload = JSON.parse(String(request?.init?.body));
    const event = payload.data[0];
    assert.equal(event.event_name, "Lead");
    assert.equal(event.event_id, "pestflow-lead-browser-123");
    assert.equal(event.action_source, "website");
    assert.equal(event.custom_data.lead_source, "owner-offer");
    assert.match(event.user_data.em[0], /^[a-f0-9]{64}$/);
    assert.match(event.user_data.ph[0], /^[a-f0-9]{64}$/);
    assert.equal(event.user_data.email, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("invalid event IDs are not sent", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response();
  };

  try {
    assert.equal(await sendLeadEvent({
      eventId: "bad id",
      eventSourceUrl: "https://pestflow.org/",
      leadSource: "owner-offer",
      userData: {},
    }), false);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
