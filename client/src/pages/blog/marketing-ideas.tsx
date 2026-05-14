import { Link } from "wouter";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getPostBySlug } from "@/lib/blog-data";

export default function MarketingIdeasPost() {
  const post = getPostBySlug("pest-control-marketing-ideas")!;

  return (
    <BlogLayout post={post}>
      <p>
        Most pest control marketing advice is generic — "build a website, post on social media, get
        reviews." None of that tells you which channels are actually printing money in 2026 and which
        ones you should kill. This is the ranked playbook based on what real PCOs are spending on and
        what's converting right now.
      </p>

      <div className="callout">
        <div className="callout-title">The short version</div>
        <ol>
          <li><strong>Google Local Services Ads</strong> — $15–$50 per booked lead, the #1 paid channel</li>
          <li><strong>Door hangers on the 20 nearest neighbors</strong> after every stop — free, compounds route density</li>
          <li><strong>Nextdoor referrals</strong> — close rate higher than any paid channel</li>
          <li><strong>Google Business Profile + reviews</strong> — the gateway to LSAs and the map pack</li>
          <li><strong>Referral programs</strong> — $50 credit per recurring referral, standard for a reason</li>
        </ol>
      </div>

      <h2>1. Google Local Services Ads (LSAs)</h2>
      <p>
        LSAs are the consensus #1 paid channel for residential pest control. They appear above
        Google's organic results and the map pack, you only pay when a <strong>lead actually
        contacts you</strong>, and Google badges you with "Google Guaranteed" once you pass background
        and license verification.
      </p>
      <ul>
        <li><strong>Cost per lead:</strong> $15–$50 depending on market</li>
        <li><strong>Booked-lead rate:</strong> 50–70% (the lead reaches you, but not all book)</li>
        <li><strong>Time to first lead:</strong> 24–72 hours after approval</li>
      </ul>
      <p>
        Get your <strong>Google Guaranteed badge</strong> approved first — it requires your applicator
        license, $1M GL insurance, and a clean background check on the business owner. Once approved,
        budget <strong>$1,500–$3,000/month</strong> as a one-truck shop and increase as you can
        deliver service.
      </p>
      <blockquote>
        "LSAs print money in my market. $30 a lead, 60% book rate. Cheapest customer acquisition I've
        ever had."
      </blockquote>

      <h2>2. Door hangers on the 20 nearest neighbors</h2>
      <p>
        After every stop, the tech hangs 20 door hangers within a 5-house radius. The hanger says
        something like:
      </p>
      <blockquote>
        We just helped your neighbor at <strong>[street name]</strong> with [pest issue]. Same-week
        appointments still available — quarterly service from $99.
      </blockquote>
      <p>
        Print 1,000 hangers for <strong>$120–$200</strong>. Tech takes 5 minutes between stops. Route
        density is the goal — the closer your accounts are, the more profitable every visit is. Owners
        who do this consistently report <strong>20–35% denser routes</strong> within 12 months.
      </p>

      <h2>3. Nextdoor (the most underrated channel)</h2>
      <p>
        Nextdoor is where suburban homeowners ask for recommendations. The strategy is simple: don't
        post ads. <strong>Answer pest questions</strong>. When someone in your service area asks "any
        good pest control companies?", a polite reply mentioning your company gets you referrals that
        close at higher rates than any paid channel.
      </p>
      <ul>
        <li>Set up a free Nextdoor Business Page in your primary ZIP codes</li>
        <li>Spend 10 minutes a day responding to pest questions (not promoting)</li>
        <li>Ask happy customers to recommend you when neighbors ask</li>
      </ul>

      <h2>4. Google Business Profile + reviews</h2>
      <p>
        Your Google Business Profile (formerly Google My Business) is the foundation that LSAs, the
        map pack, and SEO all sit on top of. Three things matter:
      </p>
      <ol>
        <li>
          <strong>Reviews — quantity and recency.</strong> Aim for 5+ new reviews per month. After
          every service, send an automated review request with a one-tap Google link. Tech name in
          the request increases response by ~30%.
        </li>
        <li>
          <strong>Photos.</strong> Upload 2–3 photos every week — techs working, trucks, before/after
          on actual jobs. Google ranks profiles with active photo uploads higher.
        </li>
        <li>
          <strong>Service area + service list.</strong> List every ZIP you serve and every pest you
          treat as a service. The map pack uses this to match queries.
        </li>
      </ol>

      <h2>5. Referral programs</h2>
      <p>
        Industry standard is <strong>$50 credit to the referring customer</strong> and{" "}
        <strong>$25 off the first service</strong> for the new customer. It works because PC
        customers know their friends and neighbors have the same pest problems they do.
      </p>
      <p>
        Mention the referral program in:
      </p>
      <ul>
        <li>Every service email and invoice</li>
        <li>The 30-day follow-up text after the initial</li>
        <li>The annual review request</li>
      </ul>

      <h2>6. SEO content (the slow but compounding channel)</h2>
      <p>
        Most pest control SEO advice tells you to target "pest control [city]" — which is{" "}
        <em>brutally competitive</em>. Don't. Target the questions homeowners actually ask:
      </p>
      <ul>
        <li>"How much does [pest] cost to treat?"</li>
        <li>"How long does it take to get rid of [pest]?"</li>
        <li>"Are [pest] dangerous?"</li>
        <li>"How do I tell if I have [pest] vs [similar pest]?"</li>
      </ul>
      <p>
        Build one of these per pest, per service area. They rank in 3–6 months and bring in steady
        organic traffic at zero ongoing cost.
      </p>

      <h2>7. Realtor and property manager partnerships</h2>
      <p>
        Every home sale in most US states needs a <strong>WDO (wood-destroying organism) inspection
        report</strong>. Build relationships with 3–5 mid-volume realtors and you'll close a steady
        flow of $125–$200 inspections — which routinely convert to $1,500+ termite treatments and
        recurring GPC accounts.
      </p>
      <p>
        Property managers are the commercial version of the same play. One multifamily PM with 200
        units is worth more than 50 single-family residentials.
      </p>

      <h2>8. Door-to-door (D2D) canvassing</h2>
      <p>
        D2D dominates in UT, TX, AZ, and parts of FL during the summer because it works at scale —
        Aptive, Hawx, and the bigger summer sales armies still grind it out. For a one-truck owner,
        a more sustainable version is <strong>strategic, geographic canvassing</strong>:
      </p>
      <ul>
        <li>Pick the 1–2 neighborhoods where you already have customers</li>
        <li>Knock 40 doors per session, expect 16–20 contacts and 1–2 closes</li>
        <li>Have a one-page flyer with the same neighbor-referenced offer as your door hangers</li>
      </ul>

      <h2>9. Branded vehicle wraps (eventually)</h2>
      <p>
        A wrapped truck generates <strong>30,000–70,000 impressions per day</strong> in a suburban
        market. It's not a fast lead generator — it's a brand and trust play. <strong>Wait until you
        have 50+ accounts</strong> before you wrap. A full vehicle wrap runs <strong>$2,500–$4,500</strong>.
      </p>

      <h2>10. EDDM postcards (great for new neighborhoods)</h2>
      <p>
        Every Door Direct Mail (USPS EDDM) lets you mail to entire carrier routes for{" "}
        <strong>~$0.19 per piece</strong>. It's not a high-conversion channel — expect a{" "}
        <strong>0.4–1.2% response rate</strong> — but it works well for blanketing new neighborhoods
        where you have no density yet. Drop one round, then drop a second round 3 weeks later for
        recall.
      </p>

      <h2>11. Facebook and Instagram ads (only do this if…)</h2>
      <p>
        Facebook can work for mosquito and termite leads in the spring, but the CPC has risen
        sharply. Treat it as a <strong>retargeting and brand awareness</strong> channel rather than a
        direct-response channel:
      </p>
      <ul>
        <li>Install Meta Pixel on your site and retarget visitors who didn't book</li>
        <li>Use video testimonials from actual customers (highest CTR)</li>
        <li>Budget cap: $500–$1,500/month for a one-truck shop</li>
      </ul>

      <h2>12. The "neighbor letter" play</h2>
      <p>
        After a high-ticket job (termite treatment, bed bug heat, rodent exclusion), mail a printed
        letter to the <strong>50 nearest houses</strong> within a week. Tone is informational, not
        salesy:
      </p>
      <blockquote>
        Last week we treated a neighbor on [street] for an active termite issue. Subterranean termites
        typically spread <strong>50–150 feet</strong> from the original colony. If you'd like a free
        WDO inspection, here's how to reach us.
      </blockquote>
      <p>
        This is a 1–3% response rate but the leads close at <strong>2–3× the rate of cold leads</strong>{" "}
        because they have visible urgency.
      </p>

      <h2>What to stop doing</h2>
      <ul>
        <li>
          <strong>Yellow Pages / phone book.</strong> If you're still paying for this, cancel it
          today.
        </li>
        <li>
          <strong>Generic Google Ads on "pest control [city]".</strong> CPC is $8–$22 and the
          competition includes Orkin and Terminix. Use LSAs instead.
        </li>
        <li>
          <strong>Buying email lists.</strong> They don't convert and they get your domain
          blacklisted.
        </li>
        <li>
          <strong>Influencer / social media managers as your first hire.</strong> Hire a tech first.
          Routes generate revenue. Instagram does not.
        </li>
      </ul>

      <h2>How to allocate marketing budget by stage</h2>
      <table>
        <thead>
          <tr>
            <th>Stage</th>
            <th>Monthly marketing budget</th>
            <th>Where to spend it</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0–25 customers</td>
            <td>$0–$500</td>
            <td>Free channels: GBP, Nextdoor, door hangers</td>
          </tr>
          <tr>
            <td>25–100 customers</td>
            <td>$1,000–$3,000</td>
            <td>LSAs, door hangers, referral incentives</td>
          </tr>
          <tr>
            <td>100–500 customers</td>
            <td>$3,000–$8,000</td>
            <td>LSAs, EDDM, vehicle wrap, SEO content</td>
          </tr>
          <tr>
            <td>500+ customers</td>
            <td>$8,000–$25,000+</td>
            <td>Multi-channel + retargeting + content + D2D crew</td>
          </tr>
        </tbody>
      </table>

      <h2>Track everything (or you're guessing)</h2>
      <p>
        Every lead source goes in your CRM. At minimum you need <strong>CAC per channel</strong> and{" "}
        <strong>LTV per channel</strong>. A $50 LSA lead that becomes a $640/year recurring customer
        has an LTV/CAC ratio of <strong>12.8:1</strong> — far better than a $30 Facebook lead that
        churns after the initial. You can't manage what you don't measure.
      </p>

      <hr />

      <p>
        Building a marketing engine starts with the basics — a real CRM, automated review requests,
        and tracking lead source on every new customer. PestFlow does all three out of the box:{" "}
        <Link href="/onboarding">start a 14-day trial</Link>, no card required. And if you're still
        figuring out the rest of your launch, read{" "}
        <Link href="/blog/how-to-start-a-pest-control-business">how to start a pest control business</Link>.
      </p>
    </BlogLayout>
  );
}
