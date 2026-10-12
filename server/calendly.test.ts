import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";
import {
  calendlyBookingSubmission,
  findExistingCalendlyBooking,
  findMatchingCalendlyProspect,
  hasValidCalendlyWebhookSignature,
  isPestFlowSetupEvent,
  resolveCalendlyBooking,
} from "./calendly";

test("maps a Calendly setup invitee into a non-outreach admin submission", () => {
  const submission = calendlyBookingSubmission(
    "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
    {
      name: "Joe Olobor",
      email: " PastorJOlobor@aol.com ",
      questions_and_answers: [
        { question: "Phone Number", answer: "+1 (646) 996-2656" },
      ],
    },
    {},
  );

  assert.deepEqual(submission, {
    type: "calendly_booking",
    firstName: "Joe",
    lastName: "Olobor",
    email: "pastorjolobor@aol.com",
    phone: "6469962656",
    companyName: "Calendly — PestFlow Set Up Call",
    website: "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
    technicians: "Booking captured without prospect outreach",
  });
});

test("reads a phone-call location and reuses the existing CRM identity", () => {
  const invitee = {
    name: "Jo",
    email: "pastorjolobor@aol.com",
  };
  const event = {
    location: { type: "outbound_call", location: "+1 646-996-2656" },
  };
  const existing = findMatchingCalendlyProspect(invitee, event, [
    {
      submittedAt: "2026-08-01T12:00:00Z",
      firstName: "Joe",
      lastName: "Olobor",
      email: "pastorjolobor@aol.com",
      phone: "6469962656",
      companyName: "Olobor Pest Control",
    },
  ]);

  const submission = calendlyBookingSubmission(
    "https://api.calendly.com/scheduled_events/event-2/invitees/invitee-2",
    invitee,
    event,
    existing,
  );

  assert.equal(submission?.firstName, "Joe");
  assert.equal(submission?.lastName, "Olobor");
  assert.equal(submission?.phone, "6469962656");
  assert.equal(submission?.companyName, "Olobor Pest Control");
});

test("filters webhook events to the PestFlow setup call", () => {
  assert.equal(isPestFlowSetupEvent({ name: "Pestflow Set Up Call" }), true);
  assert.equal(isPestFlowSetupEvent({ name: "Personal coffee chat" }), false);
  assert.equal(
    isPestFlowSetupEvent(
      { event_type: "https://api.calendly.com/event_types/expected" },
      "https://api.calendly.com/event_types/expected",
    ),
    true,
  );
});

test("resolves only exact Calendly API event and invitee resources", async () => {
  const requests: string[] = [];
  const fetchImpl = (async (input: string | URL | Request) => {
    const uri = String(input);
    requests.push(uri);
    return new Response(JSON.stringify({
      resource: uri.includes("/invitees/")
        ? { name: "Brian Weems", email: "brianweems21@yahoo.com" }
        : { name: "Pestflow Set Up Call" },
    }), { status: 200 });
  }) as typeof fetch;

  const booking = await resolveCalendlyBooking({
    event: "invitee.created",
    payload: {
      event: "https://api.calendly.com/scheduled_events/event-1",
      uri: "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
    },
  }, "token", fetchImpl);

  assert.equal(booking.invitee.email, "brianweems21@yahoo.com");
  assert.equal(booking.scheduledEvent.name, "Pestflow Set Up Call");
  assert.equal(requests.length, 2);

  await assert.rejects(
    () => resolveCalendlyBooking({
      payload: {
        event: "https://example.com/scheduled_events/event-1",
        uri: "https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1",
      },
    }, "token", fetchImpl),
    /valid resource URIs/,
  );
});

test("accepts only fresh Calendly signatures over the raw request body", () => {
  const body = Buffer.from('{"event":"invitee.created"}');
  const signingKey = "test-signing-key";
  const timestamp = 1_728_000_000;
  const digest = crypto.createHmac("sha256", signingKey)
    .update(String(timestamp)).update(".").update(body).digest("hex");
  const header = `t=${timestamp},v1=${digest}`;
  assert.equal(hasValidCalendlyWebhookSignature(body, header, signingKey, timestamp), true);
  assert.equal(hasValidCalendlyWebhookSignature(body, header, signingKey, timestamp + 181), false);
  assert.equal(hasValidCalendlyWebhookSignature(Buffer.from("changed"), header, signingKey, timestamp), false);
  assert.equal(hasValidCalendlyWebhookSignature(body, header, "wrong-key", timestamp), false);
  assert.equal(hasValidCalendlyWebhookSignature(body, undefined, signingKey, timestamp), false);
});

test("recognizes a manually backfilled booking by event and email", () => {
  const event = { uri: "https://api.calendly.com/scheduled_events/event-1" };
  const invitee = { email: "brad@example.com" };
  const rows = [
    { id: "other", type: "calendly_booking", website: event.uri, email: "other@example.com" },
    { id: "brad", type: "calendly_booking", website: event.uri, email: "brad@example.com" },
  ];
  assert.equal(findExistingCalendlyBooking("https://api.calendly.com/scheduled_events/event-1/invitees/invitee-1", event, invitee, rows)?.id, "brad");
  assert.equal(findExistingCalendlyBooking("https://api.calendly.com/scheduled_events/event-2/invitees/invitee-2", { uri: "https://api.calendly.com/scheduled_events/event-2" }, invitee, rows), undefined);
});
