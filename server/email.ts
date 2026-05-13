import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "PestFlow <noreply@pestflow.org>";

export async function sendReviewRequest(to: string, customerName: string, companyName: string) {
  return resend.emails.send({
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
  return resend.emails.send({
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
  return resend.emails.send({
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
  return resend.emails.send({
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
  return resend.emails.send({
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
  return resend.emails.send({
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
