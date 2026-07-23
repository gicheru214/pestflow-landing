import { and, eq, inArray, isNotNull, isNull, lt, lte, or, sql } from "drizzle-orm";
import { submissions, type Submission } from "@shared/schema";
import { db } from "./db";
import { syncSubmissionToMta, type MtaSyncResult } from "./mta";

const MAX_ATTEMPTS = 6;
const WORKER_INTERVAL_MS = 30_000;
const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  30 * 60_000,
  2 * 60 * 60_000,
  12 * 60 * 60_000,
  24 * 60 * 60_000,
];

export type MtaEnrollmentStatus =
  | "not_requested"
  | "queued"
  | "syncing"
  | "enrolled"
  | "skipped"
  | "failed";

export async function ensureMtaEnrollmentSchema(): Promise<void> {
  // The production landing service runs db:push before deploy. These guards
  // also make a rolling deploy safe if an old instance starts before that
  // schema push has reached every connection.
  const statements = [
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_status text NOT NULL DEFAULT 'not_requested'`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_error text`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_attempts integer NOT NULL DEFAULT 0`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_subscriber_id integer`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_e164_number text`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_group_ids jsonb`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_source text`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_last_attempt_at timestamp`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_synced_at timestamp`,
    sql`ALTER TABLE submissions ADD COLUMN IF NOT EXISTS mta_next_retry_at timestamp`,
  ];
  for (const statement of statements) await db.execute(statement);
}

export async function queueSubmissionForMta(
  submissionId: string,
  source: "landing_form" | "admin_retry",
  resetAttempts = false,
): Promise<Submission | undefined> {
  const [queued] = await db.update(submissions)
    .set({
      mtaStatus: "queued",
      mtaSource: source,
      mtaError: null,
      mtaAttempts: resetAttempts ? 0 : undefined,
      mtaNextRetryAt: new Date(),
    })
    .where(eq(submissions.id, submissionId))
    .returning();
  return queued;
}

function retryAt(attempt: number): Date {
  const delay = RETRY_DELAYS_MS[
    Math.min(Math.max(attempt - 1, 0), RETRY_DELAYS_MS.length - 1)
  ];
  return new Date(Date.now() + delay);
}

async function persistResult(
  submissionId: string,
  attempt: number,
  result: MtaSyncResult,
): Promise<void> {
  if (result.ok) {
    await db.update(submissions).set({
      mtaStatus: "enrolled",
      mtaError: null,
      mtaAttempts: attempt,
      mtaSubscriberId: result.subscriberId,
      mtaE164Number: result.e164Number ?? null,
      mtaGroupIds: result.groupIds,
      mtaSyncedAt: new Date(),
      mtaNextRetryAt: null,
    }).where(eq(submissions.id, submissionId));
    return;
  }

  if (result.skipped) {
    await db.update(submissions).set({
      mtaStatus: "skipped",
      mtaError: result.error,
      mtaAttempts: attempt,
      mtaGroupIds: result.groupIds,
      mtaNextRetryAt: null,
    }).where(eq(submissions.id, submissionId));
    return;
  }

  const shouldRetry = result.retryable !== false && attempt < MAX_ATTEMPTS;
  await db.update(submissions).set({
    mtaStatus: "failed",
    mtaError: result.error,
    mtaAttempts: attempt,
    mtaGroupIds: result.groupIds,
    mtaNextRetryAt: shouldRetry ? retryAt(attempt) : null,
  }).where(eq(submissions.id, submissionId));
}

export async function processSubmissionMtaEnrollment(
  submissionId: string,
): Promise<MtaSyncResult | null> {
  const now = new Date();
  const [claimed] = await db.update(submissions).set({
    mtaStatus: "syncing",
    mtaLastAttemptAt: now,
    mtaNextRetryAt: null,
  }).where(and(
    eq(submissions.id, submissionId),
    inArray(submissions.mtaStatus, ["queued", "failed"]),
    lt(submissions.mtaAttempts, MAX_ATTEMPTS),
  )).returning();

  if (!claimed) return null;
  const attempt = claimed.mtaAttempts + 1;
  try {
    const result = await syncSubmissionToMta(claimed);
    await persistResult(submissionId, attempt, result);
    return result;
  } catch (error) {
    const result: MtaSyncResult = {
      ok: false,
      retryable: true,
      error: error instanceof Error ? error.message : "Unexpected MTA enrollment error",
      groupIds: claimed.mtaGroupIds ?? [],
    };
    await persistResult(submissionId, attempt, result);
    return result;
  }
}

export async function processDueMtaEnrollments(limit = 25): Promise<number> {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 5 * 60_000);

  await db.update(submissions).set({
    mtaStatus: "failed",
    mtaError: "Recovered an interrupted MTA enrollment attempt",
    mtaNextRetryAt: now,
  }).where(and(
    eq(submissions.mtaStatus, "syncing"),
    or(
      isNull(submissions.mtaLastAttemptAt),
      lte(submissions.mtaLastAttemptAt, staleCutoff),
    ),
  ));

  const due = await db.select({ id: submissions.id })
    .from(submissions)
    .where(and(
      lt(submissions.mtaAttempts, MAX_ATTEMPTS),
      or(
        eq(submissions.mtaStatus, "queued"),
        and(
          eq(submissions.mtaStatus, "failed"),
          isNotNull(submissions.mtaNextRetryAt),
          lte(submissions.mtaNextRetryAt, now),
        ),
      ),
    ))
    .limit(limit);

  let processed = 0;
  for (const row of due) {
    const result = await processSubmissionMtaEnrollment(row.id);
    if (result) processed += 1;
  }
  return processed;
}

export function startMtaEnrollmentWorker(): () => void {
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const processed = await processDueMtaEnrollments();
      if (processed) console.log(`[mta] processed ${processed} queued enrollment(s)`);
    } catch (error) {
      console.warn(
        "[mta] enrollment worker failed:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      running = false;
    }
  };

  const initial = setTimeout(() => void tick(), 1_000);
  const interval = setInterval(() => void tick(), WORKER_INTERVAL_MS);
  initial.unref?.();
  interval.unref?.();
  return () => {
    clearTimeout(initial);
    clearInterval(interval);
  };
}
