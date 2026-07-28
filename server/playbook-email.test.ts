import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRevenueLeakPlaybookEmail,
  PESTFLOW_APP_STORE_URL,
  PESTFLOW_MOBILE_SIGNUP_URL,
  REVENUE_LEAK_PLAYBOOK_URL,
} from "./email";

test("playbook email attaches the PDF and sends the primary click to mobile-v2 signup", () => {
  const message = buildRevenueLeakPlaybookEmail(
    "owner@example.com",
    "Alex <Owner>",
  );

  assert.equal(message.to, "owner@example.com");
  assert.match(message.subject, /playbook/i);
  assert.match(message.html, /Hi Alex &lt;Owner&gt;,/);
  assert.match(message.html, new RegExp(PESTFLOW_MOBILE_SIGNUP_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(message.html, new RegExp(PESTFLOW_APP_STORE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(message.attachments[0]?.path, REVENUE_LEAK_PLAYBOOK_URL);
  assert.equal(
    message.attachments[0]?.filename,
    "PestFlow-Revenue-Leak-Playbook.pdf",
  );
});
