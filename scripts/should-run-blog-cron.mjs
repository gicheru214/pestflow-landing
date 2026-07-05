import { appendFile } from "node:fs/promises";

const timezone = process.env.BLOG_TIMEZONE || "America/Chicago";
const eventName = process.env.GITHUB_EVENT_NAME || "local";
const localHour = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  hour12: false,
  timeZone: timezone,
}).format(new Date());

const shouldRun = eventName !== "schedule" || localHour === "02";

console.log(
  shouldRun
    ? `[blog-cron] Running for ${eventName}; ${timezone} hour is ${localHour}.`
    : `[blog-cron] Skipping; ${timezone} hour is ${localHour}, not 02.`,
);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `run=${shouldRun}\nlocal_hour=${localHour}\n`);
}
