import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "PestFlow <noreply@pestflow.org>";
export const PESTFLOW_MOBILE_SIGNUP_URL =
  "https://app.pestflow.org/mobile-v2-field.html?screen=auth-signup&authfresh=true&source=playbook_email";
export const PESTFLOW_APP_STORE_URL =
  "https://apps.apple.com/us/app/pestflow/id6773204838";
export const REVENUE_LEAK_PLAYBOOK_URL =
  "https://pestflow.org/pest-control-revenue-leak-playbook.pdf";

function escapeEmailHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] || character,
  );
}

export function buildRevenueLeakPlaybookEmail(
  to: string,
  firstName = "",
) {
  const greeting = firstName.trim()
    ? `Hi ${escapeEmailHtml(firstName.trim())},`
    : "Hi there,";
  const textGreeting = firstName.trim() ? `Hi ${firstName.trim()},` : "Hi there,";

  return {
    from: FROM,
    to,
    subject: "Your PestFlow playbook — now put it to work",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#17211a;line-height:1.6">
        <div style="padding:28px 30px;background:#123b24;border-radius:18px 18px 0 0;color:#fff">
          <div style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#86efac">PestFlow</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2">Your 27-point Revenue Leak Playbook</h1>
        </div>
        <div style="padding:30px;border:1px solid #dce7df;border-top:0;border-radius:0 0 18px 18px">
          <p style="margin-top:0">${greeting}</p>
          <p>Your playbook is attached. Use it to find the leaks between the sale, the route, the field visit, and the invoice.</p>
          <p>The faster next step is to open PestFlow on your phone and start setting up the workflow while the scorecard is fresh.</p>
          <a href="${PESTFLOW_MOBILE_SIGNUP_URL}" style="display:block;margin:24px 0 12px;padding:15px 20px;background:#16a34a;color:#fff;border-radius:12px;text-decoration:none;text-align:center;font-weight:800">Open PestFlow and create my account →</a>
          <a href="${PESTFLOW_APP_STORE_URL}" style="display:block;margin:0 0 24px;padding:13px 20px;background:#111827;color:#fff;border-radius:12px;text-decoration:none;text-align:center;font-weight:800">Download on the Apple App Store</a>
          <p style="margin-bottom:0;color:#5c6a61;font-size:13px">The PDF is attached so you can keep it, print it, or share it with your team.</p>
        </div>
      </div>
    `,
    text: `${textGreeting}

Your 27-point Pest Control Revenue Leak Playbook is attached.

Open PestFlow and create your account:
${PESTFLOW_MOBILE_SIGNUP_URL}

Download PestFlow on the Apple App Store:
${PESTFLOW_APP_STORE_URL}

The attached PDF is yours to keep, print, or share with your team.`,
    attachments: [
      {
        path: REVENUE_LEAK_PLAYBOOK_URL,
        filename: "PestFlow-Revenue-Leak-Playbook.pdf",
      },
    ],
    tags: [
      { name: "email_type", value: "revenue_leak_playbook" },
    ],
  };
}

export async function sendRevenueLeakPlaybookEmail(
  to: string,
  firstName = "",
) {
  return getResend().emails.send(buildRevenueLeakPlaybookEmail(to, firstName));
}

export async function sendReviewRequest(to: string, customerName: string, companyName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `How did we do, ${customerName.split(" ")[0]}?`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#10b981">Thanks for choosing ${companyName}!</h2>
        <p>Hi ${customerName.split(" ")[0]},</p>
        <p>We just finished up at your property and hope everything looks great. If you have 60 seconds, a quick review makes a huge difference for our small business.</p>
        <a href="https://g.page/r/review" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Leave a Google Review →</a>
        <p style="color:#666;font-size:14px">Have a concern? Just reply to this email — we'll make it right.</p>
        <p>Thanks,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, customerName: string, companyName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Welcome to ${companyName} — you're all set`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#10b981">Welcome, ${customerName.split(" ")[0]}!</h2>
        <p>We've added you to our system and your first appointment is on the way.</p>
        <p>Here's what to expect:</p>
        <ul style="padding-left:20px;line-height:1.8">
          <li>You'll receive a reminder before each visit</li>
          <li>After each treatment, you'll get a summary of what was done</li>
          <li>Invoices are sent digitally — no paper needed</li>
        </ul>
        <p>Any questions? Just reply to this email.</p>
        <p>Thanks for your business,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(
  to: string,
  customerName: string,
  companyName: string,
  amount: string,
  paymentLink: string,
  invoiceId: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Invoice from ${companyName} — $${amount} due`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#10b981">Invoice #${invoiceId}</h2>
        <p>Hi ${customerName.split(" ")[0]},</p>
        <p>Your invoice from <strong>${companyName}</strong> is ready.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;font-size:24px;font-weight:700">$${amount}</p>
          <p style="margin:4px 0 0;color:#666;font-size:14px">Due upon receipt</p>
        </div>
        <a href="${paymentLink}" style="display:inline-block;margin:8px 0 16px;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Pay Now →</a>
        <p style="color:#666;font-size:14px">Questions? Reply to this email and we'll help you out.</p>
        <p>Thank you,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}

export async function sendQuoteFollowup(to: string, customerName: string, companyName: string) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Still interested? Your quote from ${companyName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#10b981">Just checking in</h2>
        <p>Hi ${customerName.split(" ")[0]},</p>
        <p>We sent over a quote a couple days ago and wanted to make sure you received it.</p>
        <p>If you have any questions or want to adjust the scope, just reply here — happy to work with you.</p>
        <p>When you're ready to move forward, we can usually get you scheduled within a few days.</p>
        <p>Talk soon,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}

export async function sendOverdueReminder(
  to: string,
  customerName: string,
  companyName: string,
  amount: string,
  paymentLink: string,
  daysOverdue: number
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Friendly reminder: Invoice ${daysOverdue > 14 ? "overdue" : "still open"} — $${amount}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#f59e0b">Payment Reminder</h2>
        <p>Hi ${customerName.split(" ")[0]},</p>
        <p>Just a quick reminder that your invoice for <strong>$${amount}</strong> is still open (${daysOverdue} days since we sent it).</p>
        <a href="${paymentLink}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Pay Now →</a>
        <p style="color:#666;font-size:14px">If there's an issue or you need more time, just reply and let us know.</p>
        <p>Thank you,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}

export async function sendJobSummary(
  to: string,
  customerName: string,
  companyName: string,
  serviceType: string,
  notes: string
) {
  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Treatment complete — ${serviceType}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#10b981">Service Complete</h2>
        <p>Hi ${customerName.split(" ")[0]},</p>
        <p>We finished your <strong>${serviceType}</strong> today. Here's a quick summary:</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#444">${notes || "Full interior and exterior treatment completed. All targeted areas treated."}</p>
        </div>
        <p>If you notice any activity in the next 2 weeks, reach out — re-treatments are on us.</p>
        <p>Thanks,<br/><strong>${companyName}</strong></p>
      </div>
    `,
  });
}
