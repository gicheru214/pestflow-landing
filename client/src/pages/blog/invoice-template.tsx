import { Link } from "wouter";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getPostBySlug } from "@/lib/blog-data";

export default function InvoiceTemplatePost() {
  const post = getPostBySlug("pest-control-invoice-template")!;

  return (
    <BlogLayout post={post}>
      <p>
        Most pest control owners think of invoicing as paperwork. The veterans treat it as{" "}
        <strong>cash flow control</strong>. The difference: a card on file before the tech leaves
        the driveway. The invoice is just the receipt. This guide gives you the template, the legal
        fields you can't skip in 2026, and the payment policy that keeps AR from quietly killing
        your business.
      </p>

      <div className="callout">
        <div className="callout-title">The single rule that fixes AR</div>
        <p>
          <strong>Card on file before the first service.</strong> Net 30 is how you build $300k in
          accounts receivable you'll never collect. Charge the card automatically when the tech
          closes the work order — the invoice arrives as a receipt, not a collection notice.
        </p>
      </div>

      <h2>The pest control invoice template (copy this)</h2>

      <div className="callout">
        <p><strong>[Your Company Logo]</strong></p>
        <p>
          [Company Name] · [Applicator License #] · [Phone] · [Email]
          <br />[Mailing Address]
        </p>

        <p><strong>INVOICE #{`{number}`}</strong></p>
        <p>
          <strong>Invoice date:</strong> [date]<br />
          <strong>Service date:</strong> [date]<br />
          <strong>Due date:</strong> [date] (or "Paid in full via card on file")<br />
          <strong>Technician:</strong> [Name + Tech License/ID #]
        </p>

        <p><strong>Bill to / Service address</strong></p>
        <p>
          [Customer name]<br />
          [Service address]<br />
          [Phone] · [Email]
        </p>

        <p><strong>Service performed</strong></p>
        <p>
          <strong>Target pest(s):</strong> [German cockroach, ants, spiders]<br />
          <strong>Areas treated:</strong> [Kitchen, bathrooms, garage, exterior perimeter, eaves]<br />
          <strong>Products applied:</strong>
        </p>
        <ul>
          <li>Termidor SC — EPA Reg. 7969-210 — 0.06% finished — 1.2 gal applied</li>
          <li>Advion Cockroach Gel — EPA Reg. 100-1484 — 3 placements</li>
        </ul>
        <p>
          <strong>Notes:</strong> [Active German roach pressure under refrigerator. Recommended
          follow-up at Day 14.]
        </p>

        <p><strong>Charges</strong></p>
        <p>
          Initial pest service: $189.00<br />
          Quarterly recurring (starts [date]): $109.00<br />
          Subtotal: $189.00<br />
          Sales tax (if applicable): $0.00<br />
          <strong>Total due:</strong> $189.00<br />
          <strong>Paid:</strong> $189.00 (Visa ****4242, [date])<br />
          <strong>Balance:</strong> $0.00
        </p>

        <p><strong>Payment terms</strong></p>
        <p>
          Due on receipt. Card on file is automatically charged on the day of service.<br />
          Accepted: Visa, MC, Amex, Discover, ACH. 3% surcharge on credit/debit. ACH free.<br />
          <strong>Late fee:</strong> 1.5% per month (18% APR) on unpaid balances after 30 days, where
          permitted by state law.
        </p>

        <p><strong>Re-service guarantee</strong></p>
        <p>
          30 days from this service date. Free re-service if target pest activity is observed within
          the guarantee window.
        </p>

        <p>Thank you for your business. Refer a neighbor and get $50 off your next service.</p>
      </div>

      <h2>Required fields you can't skip</h2>
      <ul>
        <li><strong>Business name + applicator license number</strong> — required in nearly every state</li>
        <li><strong>Customer name + service address</strong> — must match the work order</li>
        <li><strong>Service date</strong> — separate from invoice date for accurate audit trail</li>
        <li><strong>Technician name + license/tech ID #</strong> — required in FL, TX, CA, NY, NJ</li>
        <li><strong>Target pest treated</strong> — protects you if customer claims you missed a pest</li>
        <li><strong>Products applied with EPA reg numbers</strong> — required in FL, CA, TX; best practice everywhere</li>
        <li><strong>Charges with line items</strong> — initial, recurring, surcharges separately</li>
        <li><strong>Payment terms and late fee policy</strong> — must reference state-allowed rates</li>
        <li><strong>Re-service guarantee window</strong> — set the expectation in writing</li>
      </ul>

      <h2>Payment terms: the real-world cheat sheet</h2>

      <h3>Card on file (the gold standard)</h3>
      <p>
        Capture the card at signup. Charge it automatically the day of service. Email the invoice as
        a receipt. No collections, no late fees, no awkward calls. Card on file lifts collection
        rate from <strong>~88% on Net 30 to ~99%</strong> on card-on-file billing.
      </p>

      <h3>Net 14 or Net 30 (acceptable for commercial)</h3>
      <p>
        Commercial accounts (restaurants, property managers, schools, multifamily) often require Net
        30 because their AP system runs that way. Don't fight it — get a signed services agreement
        with the late fee policy and move on.
      </p>

      <h3>Due on receipt (good middle ground)</h3>
      <p>
        Best for high-ticket one-time jobs (termite treatment, bed bug heat, exclusion). Combine with
        a <strong>50% deposit</strong> to schedule, balance due on completion.
      </p>

      <h2>Late fees: what's legal in 2026</h2>
      <p>
        Late fees are governed by state usury laws. <strong>1.5% per month (18% APR)</strong> is
        legal in nearly every state and is industry standard for pest control. A few states cap it
        lower:
      </p>
      <ul>
        <li><strong>California:</strong> 10% APR maximum on commercial accounts unless a higher rate is in a signed contract</li>
        <li><strong>New York:</strong> 16% APR on contracts under $250,000</li>
        <li><strong>Most other states:</strong> 18–24% APR with no cap on commercial</li>
      </ul>
      <p>
        Always disclose the late fee rate on the invoice and the services agreement. Mention it
        once when a customer is 5 days late and <strong>~80% pay same day</strong>.
      </p>

      <h2>Card surcharges: pass through or eat it?</h2>
      <p>
        Card processors charge <strong>2.9%–3.5% + $0.30</strong> per transaction. You have three
        options:
      </p>
      <ol>
        <li>
          <strong>Eat the fee.</strong> Build it into your price. Simplest, no surcharge accounting.
        </li>
        <li>
          <strong>Pass the fee.</strong> Add a <strong>3% surcharge</strong> on credit/debit, ACH
          free. Now legal in 47 states (Connecticut, Massachusetts, and Maine still restrict). You
          must disclose the surcharge at the point of payment and on the invoice.
        </li>
        <li>
          <strong>Hybrid:</strong> Surcharge credit only (not debit). More compliant in restricted
          states.
        </li>
      </ol>
      <p>
        Most one-truck shops switching from "eat it" to "pass it" save{" "}
        <strong>$3,000–$8,000/year</strong> at $200k–$400k revenue. Customers rarely push back when
        ACH is offered free as the alternative.
      </p>

      <h2>Sales tax on pest control</h2>
      <p>
        Whether pest control is taxable depends on your state and the type of service:
      </p>
      <ul>
        <li><strong>Florida:</strong> Taxable (6% + local)</li>
        <li><strong>Texas:</strong> Taxable (residential pest control services)</li>
        <li><strong>California:</strong> Generally non-taxable services, but products sold separately are taxable</li>
        <li><strong>New York:</strong> Taxable for pest control services in commercial settings</li>
        <li><strong>Most other states:</strong> Non-taxable, but verify with your state's revenue department</li>
      </ul>
      <p>
        Check your state's revenue department site before assuming. Penalties for uncollected sales
        tax are typically the unpaid tax + 25% + interest.
      </p>

      <h2>How to send invoices that actually get paid</h2>
      <ol>
        <li>
          <strong>Send within 1 hour of service.</strong> Same-day invoicing collects faster than
          end-of-week batches. Have the tech close the work order in the app before they leave the
          driveway.
        </li>
        <li>
          <strong>Send a PDF, not a text body.</strong> Customers forward PDFs to their accountant.
          They delete plain-text emails.
        </li>
        <li>
          <strong>One-tap payment link.</strong> If the card on file fails, the invoice email should
          have a "pay now" link that opens a hosted checkout.
        </li>
        <li>
          <strong>Auto-reminder at +7 days.</strong> Friendly, branded, automatic. Most overdue
          accounts pay on the first reminder.
        </li>
        <li>
          <strong>Phone call at +14 days.</strong> Not email. A real call. Recovery rate jumps to
          ~75% on the first call.
        </li>
      </ol>

      <h2>Frequently asked questions</h2>

      <h3>Do I have to list every chemical on the invoice?</h3>
      <p>
        In Florida, California, and Texas, yes — including the EPA registration number. In other
        states it's best practice but not legally required. Customers who care about chemical
        exposure (kids, pets) will ask for it anyway, so listing it preempts the question.
      </p>

      <h3>What's a normal late fee for pest control invoices?</h3>
      <p>
        <strong>1.5% per month (18% APR)</strong> is industry standard and legal in nearly every
        state. Cap at your state's usury limit and always disclose it on the invoice.
      </p>

      <h3>Can I legally charge a card surcharge?</h3>
      <p>
        Yes, in 47 US states as of 2026. Connecticut, Massachusetts, and Maine still restrict it.
        You must disclose the surcharge at the point of payment, on the invoice, and (if you use
        Visa/Mastercard rules) cap it at <strong>3%</strong>.
      </p>

      <h3>Should I offer net terms to residential customers?</h3>
      <p>
        No. Residential customers should be on <strong>card on file or due on receipt</strong>. Net
        terms are for commercial accounts that demand them. Carrying residential receivables is a
        common reason small PCOs struggle with cash flow.
      </p>

      <h3>What's a fair payment processing fee to pass through?</h3>
      <p>
        <strong>3%</strong> is the standard surcharge for credit/debit. Most modern payment
        processors integrated with pest control software let you toggle this on with a click and
        handle the disclosure automatically.
      </p>

      <hr />

      <p>
        PestFlow handles every invoice field above automatically: applicator license, EPA reg
        numbers, products applied, late-fee disclosure, card on file with auto-charge, and a
        one-click "pay now" link if a card fails. <Link href="/onboarding">Start a 14-day trial</Link>{" "}
        and stop chasing payments. Already have an estimate process? Check our{" "}
        <Link href="/blog/pest-control-estimate-template">pest control estimate template</Link> to
        close the loop on the front end too.
      </p>
    </BlogLayout>
  );
}
