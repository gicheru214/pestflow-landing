import { Link } from "wouter";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getPostBySlug } from "@/lib/blog-data";

export default function EstimateTemplatePost() {
  const post = getPostBySlug("pest-control-estimate-template")!;

  return (
    <BlogLayout post={post}>
      <p>
        A good pest control estimate does one thing: <strong>it prevents the argument that happens
        three weeks later</strong>. The version below is the template active PCOs use — every field
        is there because someone, somewhere, lost money or had a contract dispute without it. Copy
        it, paste it into your CRM, and stop scribbling quotes on the back of a job sheet.
      </p>

      <div className="callout">
        <div className="callout-title">The fields that prevent disputes</div>
        <ul>
          <li><strong>Expiration date</strong> on the estimate (14–30 days)</li>
          <li><strong>What's NOT covered</strong> — explicit exclusions</li>
          <li><strong>Re-service window</strong> — how long the guarantee lasts</li>
          <li><strong>Deposit %</strong> for any job over $1,500</li>
          <li><strong>Product names + EPA reg numbers</strong> (required in FL, CA, TX)</li>
        </ul>
      </div>

      <h2>The pest control estimate template (copy this)</h2>

      <div className="callout">
        <p><strong>[Your Company Logo]</strong></p>
        <p>
          [Company Name] · [Applicator License #] · [Phone] · [Email]
          <br />[Service Address]
        </p>

        <p><strong>ESTIMATE #{`{number}`}</strong></p>
        <p>
          <strong>Issued:</strong> [date]<br />
          <strong>Valid through:</strong> [date + 30 days]<br />
          <strong>Prepared by:</strong> [name]
        </p>

        <p><strong>Customer</strong></p>
        <p>
          [Customer name]<br />
          [Service address]<br />
          [Phone] · [Email]
        </p>

        <p><strong>Service</strong></p>
        <p>
          <strong>Target pest(s):</strong> [German cockroach, Eastern subterranean termite, etc.]<br />
          <strong>Scope of work:</strong> [Interior treatment of kitchen and bathroom harborages,
          exterior perimeter spray, eaves, garage. Includes 2 follow-up visits at Day 14 and Day 28.]<br />
          <strong>Products applied:</strong> [Termidor SC — EPA Reg. 7969-210. Advion Cockroach Gel —
          EPA Reg. 100-1484.]<br />
          <strong>Re-service guarantee:</strong> [30 days from last visit. Free re-service if target
          pest activity is observed.]
        </p>

        <p><strong>Pricing</strong></p>
        <p>
          Initial service: $XXX<br />
          Follow-up visit 1 (Day 14): $XX (or "included")<br />
          Follow-up visit 2 (Day 28): $XX (or "included")<br />
          Recurring quarterly service: $XX / quarter<br />
          <strong>Total today:</strong> $XXX<br />
          <strong>Recurring after the initial cycle:</strong> $XX / quarter
        </p>

        <p><strong>Payment terms</strong></p>
        <p>
          Deposit due to schedule: <strong>50% (waived for jobs under $1,500)</strong><br />
          Balance due on completion. Card on file required for recurring service.<br />
          Accepted: Visa, MC, Amex, Discover, ACH. 3% surcharge on credit/debit; ACH free.
        </p>

        <p><strong>What's NOT included</strong></p>
        <ul>
          <li>Wildlife (raccoons, squirrels, bats, opossums) — separate service</li>
          <li>Wood-destroying organisms (termites, carpenter ants) unless specifically listed above</li>
          <li>Bed bug treatment unless specifically listed above</li>
          <li>Structural repairs or wood replacement</li>
          <li>Inaccessible areas (locked rooms, sealed crawlspaces)</li>
        </ul>

        <p><strong>Acceptance</strong></p>
        <p>
          By signing below, customer accepts the scope, pricing, and terms above. This estimate
          expires on [date]; pricing may change after that date.
        </p>
        <p>
          Customer signature: ______________________ Date: __________<br />
          Print name: ______________________
        </p>
      </div>

      <h2>Field-by-field: why each line matters</h2>

      <h3>Applicator license number on every estimate</h3>
      <p>
        Required in most states. Florida, Texas, and California enforce it strictly — quoting a job
        without your license number can be a <strong>$250–$500 fine</strong> on its own. Add it to
        your estimate header and you never have to remember.
      </p>

      <h3>Target pest, explicitly</h3>
      <p>
        Vague phrases like "general pest control" come back to bite you. List the actual target pests
        — "German cockroach, ants, spiders, occasional invaders." If the customer calls about a
        bedbug that wasn't in scope, the estimate proves you didn't quote that work.
      </p>

      <h3>Scope of work, in plain language</h3>
      <p>
        Describe exactly what the tech will do: interior + perimeter + eaves, products, number of
        visits, follow-up schedule. The clearer this is, the fewer "I thought you'd also do the
        attic" conversations you'll have.
      </p>

      <h3>Products applied + EPA registration numbers</h3>
      <p>
        Florida requires the product name and EPA reg number on every quote and invoice. Texas
        requires it for termite work. California requires it for any pesticide use. Even if you're
        not in one of those states, listing products is good practice — it makes you look more
        professional and protects you if a customer complains about chemical exposure.
      </p>

      <h3>Re-service guarantee window</h3>
      <p>
        Industry standard is <strong>30 days from the last visit</strong> on quarterly accounts. Spell
        it out so you don't get a "free service" call 90 days after the initial.
      </p>

      <h3>Pricing: initial vs recurring, separated</h3>
      <p>
        Always break out the initial from the recurring. Customers will mentally anchor on the
        smaller number — that's fine — but having both on paper prevents disputes when the first
        recurring charge hits.
      </p>

      <h3>Deposit policy</h3>
      <p>
        For any job over <strong>$1,500</strong> (termite, exclusion, bed bug heat), a{" "}
        <strong>25–50% deposit</strong> is standard and reasonable. State it on the estimate:
      </p>
      <blockquote>
        50% deposit required to schedule. Deposit credited to final balance. Refundable up to 48
        hours before the scheduled service date.
      </blockquote>

      <h3>Exclusions list</h3>
      <p>
        This is the single most important section. List everything you don't cover so a customer
        doesn't assume you do:
      </p>
      <ul>
        <li>Wildlife (raccoons, squirrels, bats, opossums)</li>
        <li>Wood-destroying organisms unless explicitly quoted</li>
        <li>Bed bugs unless explicitly quoted</li>
        <li>Structural repairs or wood replacement</li>
        <li>Inaccessible areas</li>
      </ul>

      <h3>Expiration date</h3>
      <p>
        Always put one. <strong>30 days</strong> is standard; <strong>14 days</strong> is fine for
        small jobs. This is the line that protects you when product or fuel costs rise, or when a
        customer tries to redeem a quote you wrote 14 months ago.
      </p>
      <blockquote>
        "Always put an expiration on your estimate. I had a customer try to hold me to a termite
        quote from 14 months ago."
      </blockquote>

      <h2>How to deliver the estimate</h2>
      <p>
        Mail and paper invoices look unprofessional in 2026. Email the estimate as a PDF{" "}
        <strong>within 2 hours of the inspection</strong> — faster is better. Speed of quote is the
        #1 predictor of close rate for residential pest control. Companies that quote within an hour
        close at <strong>2× the rate</strong> of companies that quote next-day.
      </p>
      <p>
        Send the estimate with a simple email subject line: "Your pest control quote — [Company]".
        Include a <strong>one-tap "accept & schedule" link</strong> if your software supports it.
      </p>

      <h2>The "verbal estimate" mistake</h2>
      <p>
        Don't quote big jobs verbally and write the estimate "later." You'll forget a detail, the
        customer will remember something different, and you'll either lose the job or do it at a
        loss. Even for a $200 ant job, hand the customer a written estimate before you leave the
        driveway.
      </p>

      <h2>State-specific requirements to double-check</h2>
      <ul>
        <li>
          <strong>Florida:</strong> Product name, EPA reg #, applicator license, and ID# on every
          estimate and invoice. The Department of Agriculture audits this.
        </li>
        <li>
          <strong>California:</strong> Pesticide use must list product, EPA reg #, application
          method, and signal word ("CAUTION/WARNING/DANGER"). Pre-application notice required.
        </li>
        <li>
          <strong>Texas:</strong> Termite pretreatment requires a separate Subterranean Termite
          Treatment Disclosure form (TPCL-122) attached to the estimate.
        </li>
        <li>
          <strong>New York / New Jersey:</strong> 48-hour written notification of pesticide
          application is required in many jurisdictions.
        </li>
      </ul>

      <h2>Common questions</h2>

      <h3>How long should a pest control estimate be valid?</h3>
      <p>
        14–30 days is standard. Anything longer exposes you to product cost increases and changes in
        the property condition.
      </p>

      <h3>Do I need the customer to sign the estimate before I start?</h3>
      <p>
        For any job over <strong>$500</strong>, yes — get a signature (digital is fine) before you
        treat. For routine sub-$500 work, an emailed acceptance ("yes, please proceed") is usually
        enough as long as your software timestamps it.
      </p>

      <h3>Can I include the chemicals and EPA numbers on the estimate?</h3>
      <p>
        Yes, and in several states (FL, CA, TX) you must. Even where it's not required, listing
        products is good practice and makes your quote look more professional than competitors who
        just write "general spray."
      </p>

      <h3>What's a fair deposit on a termite job?</h3>
      <p>
        25–50% is industry standard. For warranty-backed treatments, many companies require 50% up
        front because the chemical cost alone is $300–$800. Refundable up to 48 hours before service
        is reasonable.
      </p>

      <hr />

      <p>
        PestFlow generates estimates with every required field automatically — applicator license,
        EPA reg numbers, exclusions, expiration date, e-signature, and a one-tap acceptance link.
        Customers accept and book in one click. <Link href="/onboarding">Start a 14-day trial</Link>{" "}
        and stop chasing signed paperwork. While you're here, check our{" "}
        <Link href="/blog/pest-control-invoice-template">pest control invoice template</Link> for the
        other half of the paperwork puzzle.
      </p>
    </BlogLayout>
  );
}
