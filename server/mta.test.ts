import assert from "node:assert/strict";
import test from "node:test";
import { parseMtaGroupIds, syncSubmissionToMta, toMtaSubscriberNumber } from "./mta";

const lead = {
  type: "audit",
  firstName: "Sam",
  lastName: "Owner",
  email: "sam@example.com",
  phone: "(901) 555-0123",
  companyName: "Sam Pest",
  technicians: null,
};

function withMtaEnv(groupIds: string | undefined, run: () => Promise<void>): Promise<void> {
  const previousKey = process.env.MTA_MARKETING_API_KEY;
  const previousGroups = process.env.MTA_MARKETING_GROUP_IDS;
  process.env.MTA_MARKETING_API_KEY = "test-key";
  if (groupIds === undefined) delete process.env.MTA_MARKETING_GROUP_IDS;
  else process.env.MTA_MARKETING_GROUP_IDS = groupIds;

  return run().finally(() => {
    if (previousKey === undefined) delete process.env.MTA_MARKETING_API_KEY;
    else process.env.MTA_MARKETING_API_KEY = previousKey;
    if (previousGroups === undefined) delete process.env.MTA_MARKETING_GROUP_IDS;
    else process.env.MTA_MARKETING_GROUP_IDS = previousGroups;
  });
}

test("normalizes US phone numbers and marketing group IDs", () => {
  assert.equal(toMtaSubscriberNumber("(901) 555-0123"), 19015550123);
  assert.equal(toMtaSubscriberNumber("+1 901 555 0123"), 19015550123);
  assert.equal(toMtaSubscriberNumber("555-0123"), null);
  assert.deepEqual(parseMtaGroupIds("42, 99, bad"), [42, 99]);
});

test("requires the dedicated marketing group", async () => {
  await withMtaEnv(undefined, async () => {
    const result = await syncSubmissionToMta(lead);
    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.error, /MTA_MARKETING_GROUP_IDS/);
  });
});

test("atomically enters the workflow and verifies group enrollment", async () => {
  await withMtaEnv("4242", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ url: string; method: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = async (url, init) => {
      calls.push({
        url: String(url),
        method: String(init?.method),
        body: JSON.parse(String(init?.body)),
      });
      if (calls.length === 1) {
        return new Response(
          JSON.stringify({ data: { id: 77, e164Number: "+19015550123" } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ data: { ok: true } }), { status: 200 });
    };

    try {
      const result = await syncSubmissionToMta(lead);
      assert.deepEqual(result, {
        ok: true,
        subscriberId: 77,
        e164Number: "+19015550123",
        groupIds: [4242],
      });
      assert.equal(calls[0]?.url, "https://api.mobile-text-alerts.com/v3/subscribers");
      assert.deepEqual(calls[0]?.body.groupIds, [4242]);
      assert.equal(
        calls[1]?.url,
        "https://api.mobile-text-alerts.com/v3/groups/4242/subscribers",
      );
      assert.deepEqual(calls[1]?.body, {
        subscriberId: 77,
        addToDripCampaigns: true,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("updates and enrolls an existing subscriber instead of dropping the lead", async () => {
  await withMtaEnv("4242", async () => {
    const originalFetch = globalThis.fetch;
    const calls: Array<{ method: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = async (_url, init) => {
      calls.push({
        method: String(init?.method),
        body: JSON.parse(String(init?.body)),
      });
      if (calls.length === 1) {
        return new Response(JSON.stringify({ message: "Subscriber exists" }), { status: 409 });
      }
      if (calls.length === 2) {
        return new Response(
          JSON.stringify({ data: { id: 77, e164Number: "+19015550123" } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ data: { ok: true } }), { status: 200 });
    };

    try {
      const result = await syncSubmissionToMta(lead);
      assert.equal(result.ok, true);
      assert.deepEqual(calls.map((call) => call.method), ["POST", "PATCH", "POST"]);
      assert.deepEqual(calls[0]?.body.groupIds, [4242]);
      assert.deepEqual(calls[1]?.body.groupIds, [4242]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("treats an already-enrolled group response as idempotent success", async () => {
  await withMtaEnv("4242", async () => {
    const originalFetch = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({ data: { id: 77, e164Number: "+19015550123" } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ message: "Subscriber already belongs to group" }), {
        status: 409,
      });
    };

    try {
      const result = await syncSubmissionToMta(lead);
      assert.equal(result.ok, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

test("does not report success when MTA rejects the workflow-group enrollment", async () => {
  await withMtaEnv("4242", async () => {
    const originalFetch = globalThis.fetch;
    let callCount = 0;
    globalThis.fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response(
          JSON.stringify({ data: { id: 77, e164Number: "+19015550123" } }),
          { status: 200 },
        );
      }
      return new Response(JSON.stringify({ message: "Provider unavailable" }), { status: 503 });
    };

    try {
      const result = await syncSubmissionToMta(lead);
      assert.equal(result.ok, false);
      if (result.ok) return;
      assert.equal(result.retryable, true);
      assert.equal(result.statusCode, 503);
      assert.match(result.error, /Provider unavailable/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
