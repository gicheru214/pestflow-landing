import { Link } from "wouter";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getPostBySlug } from "@/lib/blog-data";

export default function StartBusinessPost() {
  const post = getPostBySlug("how-to-start-a-pest-control-business")!;

  return (
    <BlogLayout post={post}>
      <p>
        You can start a pest control business for under <strong>$6,200</strong> if you already own a
        vehicle, or <strong>$15,000–$65,000</strong> if you're buying a used cargo van and a basic
        equipment package. The hard part isn't capital — it's the <strong>applicator license</strong>{" "}
        most states require, which takes 30–90 days of study plus 1–2 years of documented experience
        under another licensed operator. This is the founder's playbook: licensing, gear, your first
        50 accounts, and the mistakes that kill new shops in year one.
      </p>

      <div className="callout">
        <div className="callout-title">The path, in order</div>
        <ol>
          <li>Pass your state's <strong>applicator/operator exam</strong> (or get a sponsor)</li>
          <li>Form an <strong>LLC + EIN</strong> and get general liability insurance</li>
          <li>Buy <strong>chemicals + a B&G sprayer + a backpack sprayer</strong></li>
          <li>Wrap a used van (or skip the wrap for now)</li>
          <li>Get a CRM and route software <em>before</em> account #10, not after #50</li>
          <li>Sell your first 50 accounts door-to-door + LSA + referrals</li>
        </ol>
      </div>

      <h2>Step 1: Get licensed</h2>
      <p>
        Every state requires a <strong>pesticide applicator license</strong> for commercial pest
        control work. The exact name varies — Certified Operator (FL), Qualifying Party (TX), QAC
        (CA), Commercial Applicator (most other states) — but the requirements are similar:
      </p>
      <ul>
        <li><strong>1–3 years of documented experience</strong> under a licensed applicator</li>
        <li><strong>A passing exam score</strong> in each pest category you want to treat (General Household Pest, Termite/WDO, Lawn & Ornamental, Public Health, etc.)</li>
        <li><strong>Continuing education</strong> — typically 8–16 CEU credits every 1–2 years</li>
        <li><strong>Annual license fee</strong> — $50 in Oregon, $150 in Virginia, $300 + $10/applicator ID in Florida, up to $1,000+ for multi-category licenses in California</li>
      </ul>

      <h3>What if I don't have the experience hours?</h3>
      <p>
        The most common shortcut is to <strong>work under another company's license</strong> as a tech
        for 1–2 years while you log hours, then sit for the exam. If you don't want to wait, some
        states (TX, FL, NC) allow you to <strong>hire a "qualifying agent"</strong> — a licensed
        operator who carries your company's license for an annual fee of <strong>$8,000–$25,000</strong>.
        It's a real expense but it lets you operate immediately under your own brand.
      </p>

      <h3>How hard is the exam?</h3>
      <p>
        The General Household Pest exam is multiple choice, 70–100 questions, 70%+ to pass. Pass
        rates run <strong>40–65%</strong> on first attempt. Most owners pass after 30–60 hours of
        study using the <strong>NPMA Field Guide</strong> and the state-specific study manual. The
        Termite/WDO exam is harder — pass rates closer to 35%.
      </p>

      <h2>Step 2: Set up the business</h2>
      <p>The legal/admin layer takes about a weekend and costs around <strong>$700–$1,200</strong>:</p>
      <ul>
        <li><strong>LLC formation:</strong> $50–$500 depending on state (Delaware/Wyoming is cheap; California is $800/yr franchise tax)</li>
        <li><strong>EIN:</strong> Free from IRS.gov</li>
        <li><strong>Business bank account + business credit card:</strong> Free, use a local credit union if possible</li>
        <li><strong>General liability insurance:</strong> $1,200–$3,000/yr for a one-truck operation ($1M / $2M policy is standard)</li>
        <li><strong>Pesticide applicator bond:</strong> Required in some states (FL, TX), $50–$200/yr</li>
        <li><strong>State business license + sales tax permit:</strong> $50–$300 depending on state</li>
        <li><strong>Workers' comp insurance:</strong> Required as soon as you hire your first tech ($1,500–$3,500/yr per employee)</li>
      </ul>

      <h2>Step 3: Buy equipment (without overspending)</h2>
      <p>
        The biggest mistake new owners make is buying a wrapped F-150 and a $4,000 power sprayer
        before they have 20 customers. Here's the actual starter package most successful one-truck
        owners report:
      </p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Used cargo van (Transit Connect, Ford Econoline, Promaster City)</td>
            <td>$10,000–$22,000</td>
          </tr>
          <tr>
            <td>B&G compressed air sprayer (1-gal SS)</td>
            <td>$175–$295</td>
          </tr>
          <tr>
            <td>Backpack sprayer (Stihl SR430 or Solo)</td>
            <td>$200–$650</td>
          </tr>
          <tr>
            <td>Granule spreader</td>
            <td>$45–$95</td>
          </tr>
          <tr>
            <td>Dustagator + dust applicator (rodent voids)</td>
            <td>$120–$250</td>
          </tr>
          <tr>
            <td>Termite drill, bit set, plug kit</td>
            <td>$250–$450</td>
          </tr>
          <tr>
            <td>Inspection mirror, flashlight, moisture meter</td>
            <td>$150–$300</td>
          </tr>
          <tr>
            <td>PPE (respirator, gloves, Tyvek)</td>
            <td>$200–$400</td>
          </tr>
          <tr>
            <td>Chemicals + bait + IGR starter stock</td>
            <td>$800–$1,500</td>
          </tr>
          <tr>
            <td>Vehicle decals (skip the full wrap)</td>
            <td>$150–$400</td>
          </tr>
          <tr>
            <td><strong>Total without vehicle</strong></td>
            <td><strong>$2,090–$4,335</strong></td>
          </tr>
        </tbody>
      </table>

      <blockquote>
        "Don't buy a wrapped F-150 before you have 50 accounts. I burned $40k on a truck I couldn't
        justify. The B&G works the same on the side of any van."
      </blockquote>

      <h3>Starter chemicals worth stocking</h3>
      <ul>
        <li><strong>Termidor SC or Taurus SC</strong> (perimeter / termite barriers)</li>
        <li><strong>Bifen IT or Tempo SC</strong> (general residual)</li>
        <li><strong>Demand CS or Talstar P</strong> (encapsulated for hot summer applications)</li>
        <li><strong>Advion Cockroach Gel + Maxforce FC Magnum</strong> (German roach jobs)</li>
        <li><strong>Gentrol IGR + NyGuard IGR</strong> (cockroaches, fleas)</li>
        <li><strong>Drione dust + CimeXa</strong> (wall voids, bed bug spot work)</li>
        <li><strong>Talstar P granules</strong> (turf, mulch beds)</li>
        <li><strong>Contrac Blox or Final Blox</strong> (rodent bait)</li>
      </ul>

      <h2>Step 4: Pick your software (before you hate spreadsheets)</h2>
      <p>
        The single biggest predictor of whether a one-truck shop scales past <strong>$300k</strong>{" "}
        is whether the owner stops running things on paper before they hit 50 accounts. Get a
        purpose-built pest control CRM/route software early — it pays for itself the moment you stop
        forgetting which customer you treated last quarter.
      </p>
      <p>
        At minimum you need: <strong>scheduling, route optimization, customer notes,
        recurring billing, mobile tech app, and automated review requests</strong>. PestFlow does all
        of that, and you can{" "}
        <Link href="/onboarding">start a free trial</Link> without a credit card.
      </p>

      <h2>Step 5: Get your first 50 accounts</h2>
      <p>
        Marketing is the part most new owners underestimate. You will not get a customer because you
        bought a Yellow Pages ad. Here is the order that actually works in 2026:
      </p>
      <ol>
        <li>
          <strong>Google Business Profile + Local Services Ads.</strong> Set up your GBP in week one,
          ask the first 10 customers for reviews, and turn on LSAs as soon as you have 5–10 reviews.
          LSAs cost <strong>$15–$50 per booked lead</strong> and they convert better than any other
          paid channel.
        </li>
        <li>
          <strong>Door hangers after every stop.</strong> Hit the <strong>20 nearest neighbors</strong>{" "}
          with "we just helped your neighbor at 123 Maple — here's how to reach us." Free, takes 5
          minutes, and route density compounds.
        </li>
        <li>
          <strong>Nextdoor.</strong> Don't post ads. Answer pest questions in your service area.
          Referrals convert at <strong>2–3× your paid channels</strong>.
        </li>
        <li>
          <strong>Referral program.</strong> $50 credit to the referring customer and $25 off the new
          customer's first service. Standard, works.
        </li>
        <li>
          <strong>Realtor partnerships.</strong> A WDO/termite inspection on every home sale is gold.
          Pick 3 mid-volume agents and buy them coffee.
        </li>
      </ol>
      <p>
        For a full marketing playbook, see our{" "}
        <Link href="/blog/pest-control-marketing-ideas">pest control marketing ideas</Link> guide.
      </p>

      <h2>What to charge in year one</h2>
      <p>
        Don't underprice to "build a book." You'll be stuck with low-margin accounts that resist price
        increases. Start with these floors (full benchmarks in our{" "}
        <Link href="/blog/pest-control-pricing-chart">pricing chart</Link>):
      </p>
      <ul>
        <li><strong>GPC quarterly:</strong> $109 initial / $109 quarterly recurring (or higher)</li>
        <li><strong>Minimum stop:</strong> $89, no exceptions</li>
        <li><strong>German roach clean-out:</strong> $325 floor</li>
        <li><strong>Termite liquid barrier:</strong> $9 / linear foot minimum</li>
      </ul>

      <h2>Year-one revenue benchmarks</h2>
      <p>
        Realistic targets for a solo owner-operator who works the business full time:
      </p>
      <ul>
        <li><strong>Month 6:</strong> 25–40 recurring accounts, $4k–$7k MRR</li>
        <li><strong>Month 12:</strong> 80–150 recurring accounts, $10k–$18k MRR</li>
        <li><strong>Year 1 total revenue:</strong> $80k–$180k gross</li>
        <li><strong>Year 1 take-home (after vehicle, fuel, insurance, chemicals):</strong> $35k–$80k</li>
      </ul>
      <p>
        Owners who hit the high end usually have one thing in common: they knock doors after every
        job from day one. Owners who plateau usually rely on a single channel (just LSAs, or just
        referrals) and don't compound density.
      </p>

      <h2>The five mistakes that kill new shops</h2>
      <ol>
        <li><strong>Buying a wrapped truck before customer #50.</strong> Don't.</li>
        <li><strong>Underpricing to "build a book."</strong> You'll spend year two raising prices and losing customers.</li>
        <li><strong>No card on file.</strong> AR will quietly eat your business. Get a card on file before the tech leaves the driveway.</li>
        <li><strong>One marketing channel.</strong> If LSAs slow down, you need door hangers and referrals to keep you afloat.</li>
        <li><strong>Running everything on paper.</strong> You will forget a re-service, a renewal, and a tech callback. Get software early.</li>
      </ol>

      <h2>Frequently asked questions</h2>
      <h3>How much does it cost to start a pest control business?</h3>
      <p>
        Without a vehicle, <strong>$3,145–$6,200</strong> for license, insurance, equipment, and
        starter chemicals. With a used cargo van, plan on <strong>$15,000–$30,000</strong> total.
      </p>

      <h3>Do I need a special license to start?</h3>
      <p>
        Yes, in every US state. The license name and category structure vary, but you'll need a
        passing exam in at least General Household Pest (GHP) to do residential pest control.
      </p>

      <h3>Can I run pest control out of my house?</h3>
      <p>
        For the first year, yes — most one-truck owners do. You'll need a locked chemical storage
        area (a shed or garage cabinet) that meets state requirements, plus a separate water source
        for sprayer fills. Once you hit ~$250k revenue or hire a second tech, a small commercial
        space starts to make sense.
      </p>

      <h3>How long until I'm profitable?</h3>
      <p>
        Most owner-operators break even on month-to-month operating costs within{" "}
        <strong>4–8 months</strong>. Repaying the startup investment usually takes{" "}
        <strong>12–18 months</strong>. Recurring revenue is what makes pest control attractive — by
        year two, ~70% of your annual revenue is already booked at the start of each quarter.
      </p>

      <hr />

      <p>
        Building a pest control business in 2026? PestFlow's{" "}
        <Link href="/onboarding">free 14-day trial</Link> gives you the route board, recurring
        billing, and tech app you'll need before account #20. No card required.
      </p>
    </BlogLayout>
  );
}
