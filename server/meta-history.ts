import { desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import {
  metaHistoricalEvents,
  metaHistoricalSnapshots,
  metaProspectRegistrations,
} from "@shared/schema";
import { db } from "./db";

const META_HISTORY_TIME_ZONE = "America/Mexico_City";
const MAX_IMPORT_ROWS = 10_000;

const historyRowSchema = z.object({
  unixTimeStart: z.number().int().min(1_500_000_000).max(2_100_000_000),
  browserReceivedCount: z.number().int().min(0).max(1_000_000),
  serverReceivedCount: z.number().int().min(0).max(1_000_000),
  totalReceivedCount: z.number().int().min(0).max(2_000_000),
}).superRefine((row, ctx) => {
  if (
    row.totalReceivedCount
    < Math.max(row.browserReceivedCount, row.serverReceivedCount)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "totalReceivedCount cannot be lower than an integration count",
    });
  }
});

const historyImportSchema = z.object({
  datasetId: z.string().regex(/^\d{5,32}$/),
  eventName: z.string().trim().min(1).max(80).default("Lead"),
  processedCount: z.number().int().min(0).max(10_000_000),
  eventMatchQuality: z.number().min(0).max(10).nullable().optional(),
  advancedMatchingRate: z.number().int().min(0).max(100).nullable().optional(),
  affectedAdSpend: z.number().min(0).max(100_000_000).nullable().optional(),
  rangeStartUnix: z.number().int().min(1_500_000_000).max(2_100_000_000).optional(),
  rangeEndUnix: z.number().int().min(1_500_000_000).max(2_100_000_000).optional(),
  rows: z.array(historyRowSchema).min(1).max(MAX_IMPORT_ROWS),
}).superRefine((payload, ctx) => {
  if (
    payload.rangeStartUnix != null
    && payload.rangeEndUnix != null
    && payload.rangeEndUnix < payload.rangeStartUnix
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "rangeEndUnix cannot be earlier than rangeStartUnix",
    });
  }
});

export type MetaHistoryImport = z.infer<typeof historyImportSchema>;

export interface MetaHistoryDay {
  date: string;
  browserReceivedCount: number;
  serverReceivedCount: number;
  totalReceivedCount: number;
  adminProspects: number;
  ledgerSent: number;
  ledgerHistorical: number;
}

export interface MetaHistoryCombined {
  available: boolean;
  snapshot: {
    datasetId: string;
    eventName: string;
    rangeStart: string;
    rangeEnd: string;
    processedCount: number;
    browserReceivedCount: number;
    serverReceivedCount: number;
    totalReceivedCount: number;
    deduplicatedCount: number;
    eventMatchQuality: number | null;
    advancedMatchingRate: number | null;
    affectedAdSpend: number | null;
    source: string;
    importedAt: string;
    adminProspectsInRange: number;
    ledgerSentInRange: number;
    ledgerHistoricalInRange: number;
  } | null;
  days: MetaHistoryDay[];
}

function safeInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function localDateKey(value: Date | number): string {
  const date = typeof value === "number" ? new Date(value * 1000) : value;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: META_HISTORY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}`;
}

export function normalizeMetaHistoryImport(input: unknown): MetaHistoryImport {
  const parsed = historyImportSchema.parse(input);
  return {
    ...parsed,
    eventName: parsed.eventName.trim(),
    rows: [...parsed.rows].sort((a, b) => a.unixTimeStart - b.unixTimeStart),
  };
}

export async function ensureMetaHistoricalSchema(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meta_historical_snapshots (
      id varchar(200) PRIMARY KEY,
      dataset_id varchar(32) NOT NULL,
      event_name varchar(80) NOT NULL,
      range_start_unix integer NOT NULL,
      range_end_unix integer NOT NULL,
      processed_count integer NOT NULL,
      browser_received_count integer NOT NULL,
      server_received_count integer NOT NULL,
      total_received_count integer NOT NULL,
      deduplicated_count integer NOT NULL,
      event_match_quality decimal(4, 2),
      advanced_matching_rate integer,
      affected_ad_spend decimal(12, 2),
      source text NOT NULL DEFAULT 'events_manager_csv',
      imported_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS meta_historical_events (
      id varchar(220) PRIMARY KEY,
      dataset_id varchar(32) NOT NULL,
      event_name varchar(80) NOT NULL,
      unix_time_start integer NOT NULL,
      browser_received_count integer NOT NULL,
      server_received_count integer NOT NULL,
      total_received_count integer NOT NULL,
      imported_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS meta_history_snapshot_latest_idx
    ON meta_historical_snapshots (imported_at DESC)
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS meta_history_event_range_idx
    ON meta_historical_events (dataset_id, event_name, unix_time_start)
  `);
}

export async function importMetaHistoricalData(
  input: unknown,
): Promise<MetaHistoryCombined> {
  const payload = normalizeMetaHistoryImport(input);
  const rangeStartUnix = payload.rangeStartUnix
    ?? payload.rows[0].unixTimeStart;
  const rangeEndUnix = payload.rangeEndUnix
    ?? payload.rows[payload.rows.length - 1].unixTimeStart;
  const importedAt = new Date();
  const browserReceivedCount = payload.rows.reduce(
    (sum, row) => sum + row.browserReceivedCount,
    0,
  );
  const serverReceivedCount = payload.rows.reduce(
    (sum, row) => sum + row.serverReceivedCount,
    0,
  );
  const totalReceivedCount = payload.rows.reduce(
    (sum, row) => sum + row.totalReceivedCount,
    0,
  );
  const deduplicatedCount = Math.max(
    totalReceivedCount - payload.processedCount,
    0,
  );
  const snapshotId = [
    payload.datasetId,
    payload.eventName,
    rangeStartUnix,
    rangeEndUnix,
  ].join(":");

  await db.transaction(async (tx) => {
    await tx.insert(metaHistoricalSnapshots).values({
      id: snapshotId,
      datasetId: payload.datasetId,
      eventName: payload.eventName,
      rangeStartUnix,
      rangeEndUnix,
      processedCount: payload.processedCount,
      browserReceivedCount,
      serverReceivedCount,
      totalReceivedCount,
      deduplicatedCount,
      eventMatchQuality: payload.eventMatchQuality == null
        ? null
        : String(payload.eventMatchQuality),
      advancedMatchingRate: payload.advancedMatchingRate ?? null,
      affectedAdSpend: payload.affectedAdSpend == null
        ? null
        : String(payload.affectedAdSpend),
      source: "events_manager_csv",
      importedAt,
    }).onConflictDoUpdate({
      target: metaHistoricalSnapshots.id,
      set: {
        processedCount: payload.processedCount,
        browserReceivedCount,
        serverReceivedCount,
        totalReceivedCount,
        deduplicatedCount,
        eventMatchQuality: payload.eventMatchQuality == null
          ? null
          : String(payload.eventMatchQuality),
        advancedMatchingRate: payload.advancedMatchingRate ?? null,
        affectedAdSpend: payload.affectedAdSpend == null
          ? null
          : String(payload.affectedAdSpend),
        importedAt,
      },
    });

    for (const row of payload.rows) {
      const id = [
        payload.datasetId,
        payload.eventName,
        row.unixTimeStart,
      ].join(":");
      await tx.insert(metaHistoricalEvents).values({
        id,
        datasetId: payload.datasetId,
        eventName: payload.eventName,
        unixTimeStart: row.unixTimeStart,
        browserReceivedCount: row.browserReceivedCount,
        serverReceivedCount: row.serverReceivedCount,
        totalReceivedCount: row.totalReceivedCount,
        importedAt,
      }).onConflictDoUpdate({
        target: metaHistoricalEvents.id,
        set: {
          browserReceivedCount: row.browserReceivedCount,
          serverReceivedCount: row.serverReceivedCount,
          totalReceivedCount: row.totalReceivedCount,
          importedAt,
        },
      });
    }
  });

  return getCombinedMetaHistory();
}

export async function getCombinedMetaHistory(): Promise<MetaHistoryCombined> {
  const [snapshot] = await db.select()
    .from(metaHistoricalSnapshots)
    .orderBy(desc(metaHistoricalSnapshots.importedAt))
    .limit(1);
  if (!snapshot) return { available: false, snapshot: null, days: [] };

  const rangeStart = new Date(snapshot.rangeStartUnix * 1000);
  const rangeEndExclusive = new Date((snapshot.rangeEndUnix + 1) * 1000);
  const [events, registrations] = await Promise.all([
    db.select().from(metaHistoricalEvents).where(
      eq(metaHistoricalEvents.datasetId, snapshot.datasetId),
    ),
    db.select({
      latestSubmittedAt: metaProspectRegistrations.latestSubmittedAt,
      status: metaProspectRegistrations.status,
    }).from(metaProspectRegistrations).where(
      gte(metaProspectRegistrations.latestSubmittedAt, rangeStart),
    ),
  ]);

  const days = new Map<string, MetaHistoryDay>();
  const dayFor = (date: string) => {
    const existing = days.get(date);
    if (existing) return existing;
    const created: MetaHistoryDay = {
      date,
      browserReceivedCount: 0,
      serverReceivedCount: 0,
      totalReceivedCount: 0,
      adminProspects: 0,
      ledgerSent: 0,
      ledgerHistorical: 0,
    };
    days.set(date, created);
    return created;
  };

  for (const event of events) {
    if (
      event.eventName !== snapshot.eventName
      || event.unixTimeStart < snapshot.rangeStartUnix
      || event.unixTimeStart > snapshot.rangeEndUnix
    ) continue;
    const day = dayFor(localDateKey(event.unixTimeStart));
    day.browserReceivedCount += safeInteger(event.browserReceivedCount);
    day.serverReceivedCount += safeInteger(event.serverReceivedCount);
    day.totalReceivedCount += safeInteger(event.totalReceivedCount);
  }

  let adminProspectsInRange = 0;
  let ledgerSentInRange = 0;
  let ledgerHistoricalInRange = 0;
  for (const registration of registrations) {
    if (registration.latestSubmittedAt >= rangeEndExclusive) continue;
    const day = dayFor(localDateKey(registration.latestSubmittedAt));
    day.adminProspects += 1;
    adminProspectsInRange += 1;
    if (registration.status === "sent") {
      day.ledgerSent += 1;
      ledgerSentInRange += 1;
    } else if (registration.status === "expired") {
      day.ledgerHistorical += 1;
      ledgerHistoricalInRange += 1;
    }
  }

  return {
    available: true,
    snapshot: {
      datasetId: snapshot.datasetId,
      eventName: snapshot.eventName,
      rangeStart: rangeStart.toISOString(),
      rangeEnd: new Date(snapshot.rangeEndUnix * 1000).toISOString(),
      processedCount: snapshot.processedCount,
      browserReceivedCount: snapshot.browserReceivedCount,
      serverReceivedCount: snapshot.serverReceivedCount,
      totalReceivedCount: snapshot.totalReceivedCount,
      deduplicatedCount: snapshot.deduplicatedCount,
      eventMatchQuality: snapshot.eventMatchQuality == null
        ? null
        : Number(snapshot.eventMatchQuality),
      advancedMatchingRate: snapshot.advancedMatchingRate,
      affectedAdSpend: snapshot.affectedAdSpend == null
        ? null
        : Number(snapshot.affectedAdSpend),
      source: snapshot.source,
      importedAt: snapshot.importedAt.toISOString(),
      adminProspectsInRange,
      ledgerSentInRange,
      ledgerHistoricalInRange,
    },
    days: Array.from(days.values()).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
