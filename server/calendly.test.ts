import assert from "node:assert/strict";
import test from "node:test";
import {
  calendlyBookingSubmission,
  findMatchingCalendlyProspect,
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
