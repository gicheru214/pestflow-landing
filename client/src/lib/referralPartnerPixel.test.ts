import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";

const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const pixelScript = html.match(/<!-- Meta Pixel Code -->\s*<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(pixelScript, "Meta Pixel script exists in the page head");

function pixelEvents(pathname: string): string[] {
  const context: Record<string, unknown> = {
    location: { pathname },
    document: {
      createElement: () => ({}),
      getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }],
    },
  };
  context.window = context;
  runInNewContext(pixelScript, context);
  const fbq = context.fbq as { queue: Array<ArrayLike<unknown>> };
  return Array.from(fbq.queue).filter((args) => args[0] === "track").map((args) => String(args[1]));
}

test("the thank-you URL sends Lead on a direct page load", () => {
  assert.deepEqual(pixelEvents("/referral-partners/thanks"), ["PageView", "Lead"]);
  assert.deepEqual(pixelEvents("/referral-partners/thanks/"), ["PageView", "Lead"]);
  assert.deepEqual(pixelEvents("/referral-partners"), ["PageView"]);
});
