import { appendFile, readFile } from "node:fs/promises";

const timezone = process.env.BLOG_TIMEZONE || "America/Chicago";
const eventName = process.env.GITHUB_EVENT_NAME || "local";
const localHourFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hour12: false,
  timeZone: timezone,
});

let scheduledExpression = "";
if (eventName === "schedule" && process.env.GITHUB_EVENT_PATH) {
  try {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
    scheduledExpression = String(event.schedule || "");
  } catch (error) {
    console.warn(`[blog-cron] Could not read the schedule payload: ${error.message}`);
  }
}

const scheduledHourMatch = scheduledExpression.match(/^0\s+(7|8)\s+/);
const scheduledUtcHour = scheduledHourMatch ? Number(scheduledHourMatch[1]) : null;
const now = new Date();
const scheduledInstant = scheduledUtcHour === null
  ? now
  : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), scheduledUtcHour));
const intendedLocalHour = localHourFormatter.format(scheduledInstant);

const shouldRun = eventName !== "schedule" || intendedLocalHour === "02";

console.log(
  shouldRun
    ? `[blog-cron] Running for ${eventName}; trigger ${scheduledExpression || "manual"} maps to ${intendedLocalHour}:00 ${timezone}.`
    : `[blog-cron] Skipping trigger ${scheduledExpression || "unknown"}; it maps to ${intendedLocalHour}:00 ${timezone}, not 02:00.`,
);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `run=${shouldRun}\nlocal_hour=${intendedLocalHour}\n`);
}
