import { storage } from "../server/storage";
import { syncSubmissionToMta } from "../server/mta";

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : Number.POSITIVE_INFINITY;

const submissions = await storage.getSubmissions();
const withPhones = submissions.filter((submission) => {
  const digits = (submission.phone ?? "").replace(/\D/g, "");
  return digits.length >= 10;
});

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let attempted = 0;
let synced = 0;
let skipped = 0;
let failed = 0;

for (const submission of withPhones.slice(0, Number.isFinite(limit) ? limit : undefined)) {
  if (attempted > 0) await delay(1100);
  attempted++;
  const result = await syncSubmissionToMta(submission);
  if (result.ok) {
    synced++;
    continue;
  }
  if (result.skipped) {
    skipped++;
    continue;
  }
  failed++;
  console.warn(`[mta-backfill] ${submission.id} ${submission.email}: ${result.error}`);
}

console.log(JSON.stringify({
  totalSubmissions: submissions.length,
  withPhones: withPhones.length,
  attempted,
  synced,
  skipped,
  failed,
}, null, 2));
