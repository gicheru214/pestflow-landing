import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@127.0.0.1:5432/test";

const { normalizeMetaHistoryImport } = await import("./meta-history");

test("normalizes and sorts an Events Manager history import", () => {
  const normalized = normalizeMetaHistoryImport({
    datasetId: "1316762993672485",
    eventName: " Lead ",
    processedCount: 3,
    eventMatchQuality: 8.2,
    advancedMatchingRate: 47,
    affectedAdSpend: 317,
    rows: [
      {
        unixTimeStart: 1782600000,
        browserReceivedCount: 1,
        serverReceivedCount: 2,
        totalReceivedCount: 3,
      },
      {
        unixTimeStart: 1782500000,
        browserReceivedCount: 1,
        serverReceivedCount: 1,
        totalReceivedCount: 2,
      },
    ],
  });

  assert.equal(normalized.eventName, "Lead");
  assert.equal(normalized.rows[0].unixTimeStart, 1782500000);
  assert.equal(normalized.rows[1].serverReceivedCount, 2);
});

test("rejects an impossible Meta integration total", () => {
  assert.throws(() => normalizeMetaHistoryImport({
    datasetId: "1316762993672485",
    eventName: "Lead",
    processedCount: 1,
    rows: [{
      unixTimeStart: 1782500000,
      browserReceivedCount: 2,
      serverReceivedCount: 1,
      totalReceivedCount: 1,
    }],
  }));
});
