import { Link } from "wouter";
import { BlogLayout } from "@/components/blog/blog-layout";
import { getPostBySlug } from "@/lib/blog-data";

export default function PricingChartPost() {
  const post = getPostBySlug("pest-control-pricing-chart")!;

  return (
    <BlogLayout post={post}>
      <p>
        Most pest control owners don't lose money on the jobs they say no to — they lose it on the
        jobs they underbid. This is the pricing chart we wish every new PCO had before they hit the
        street. The benchmarks below are pulled from active operators in the US South, Midwest, and
        Pacific Northwest — adjusted for 2026 product and labor costs.
      </p>

      <div className="callout">
        <div className="callout-title">Three rules before you set prices</div>
        <ol>
          <li>
            <strong>Price for the callback, not the first visit.</strong> Every job has a hidden cost
            in re-services. Build that into the initial.
          </li>
          <li>
            <strong>Set a minimum stop price.</strong> $89–$125 regardless of property size. Anything
            below that and you're losing money on windshield time.
          </li>
          <li>
            <strong>Never quote a German roach job under $300.</strong> You'll be back three times.
            Price like it.
          </li>
        </ol>
      </div>

      <h2>General pest control (GPC) pricing</h2>
      <p>
        This is your bread and butter. Initial covers interior, perimeter, eaves, and garage.
        Recurring is exterior-only unless the customer calls you in. Bumping interior frequency from
        "on request" to "every other quarter" raises customer satisfaction without much cost — most
        veterans treat interior at the initial and once a year after that.
      </p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Initial</th>
            <th>Recurring</th>
            <th>Annual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>GPC quarterly</td>
            <td>$150–$300</td>
            <td>$95–$135 / qtr</td>
            <td>$530–$840</td>
          </tr>
          <tr>
            <td>GPC bi-monthly</td>
            <td>$150–$275</td>
            <td>$75–$110 / visit</td>
            <td>$600–$935</td>
          </tr>
          <tr>
            <td>GPC monthly</td>
            <td>$125–$250</td>
            <td>$45–$70 / visit</td>
            <td>$665–$1,090</td>
          </tr>
          <tr>
            <td>Exterior-only QP</td>
            <td>$99–$199</td>
            <td>$85–$110 / qtr</td>
            <td>$439–$639</td>
          </tr>
          <tr>
            <td>One-time GPC service</td>
            <td>$179–$350</td>
            <td>—</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>

      <p>
        Exterior-only quarterly at <strong>$99/quarter with a $99 initial</strong> is the most popular
        residential plan we see from owners who care about close rate. It's simple, the math is
        obvious, and route density gets very tight if you sell it neighborhood-by-neighborhood.
      </p>

      <h2>German roach clean-out pricing</h2>
      <p>
        The job rookies lose money on. A real German roach job is 3 hours on the first visit (vacuum,
        gel bait every harborage, IGR fog, void treatments) plus two follow-ups at 14 and 28 days.
        That's 6–7 hours of tech time and $40–$60 in product per job.
      </p>
      <ul>
        <li><strong>1-bedroom apartment:</strong> $275–$450 (3-visit cycle)</li>
        <li><strong>2–3 bedroom apartment/home:</strong> $375–$650 (3-visit cycle)</li>
        <li><strong>Severe / commercial kitchen:</strong> $750–$2,500+ depending on size and frequency</li>
      </ul>
      <blockquote>
        "I priced German roaches at $185 my first year. Did three of them in one month, lost money on
        every single one. Now my floor is $325 and I won't touch it for less."
      </blockquote>

      <h2>Bed bug treatment pricing</h2>
      <p>
        Two product options, very different price points. Chemical is slower, cheaper, and requires
        customer prep. Heat is faster, more expensive, and almost always one-and-done.
      </p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chemical, 1 room</td>
            <td>$300–$500</td>
            <td>3 (Day 0, 14, 28)</td>
          </tr>
          <tr>
            <td>Chemical, whole home</td>
            <td>$775–$1,500</td>
            <td>3</td>
          </tr>
          <tr>
            <td>Heat treatment</td>
            <td>$1.50–$3.00 / sqft, $1,500 minimum</td>
            <td>1 (+ optional inspection)</td>
          </tr>
          <tr>
            <td>K-9 inspection</td>
            <td>$250–$500 / unit</td>
            <td>1</td>
          </tr>
        </tbody>
      </table>

      <p>
        Heat is where the margins are if you own the equipment, but the equipment cost (Temp-Air or
        ThermaPureHeat rig) is $25k–$60k. Most owners under $500k revenue sub the heat work to a
        specialist and mark it up <strong>20–30%</strong>.
      </p>

      <h2>Termite pricing</h2>
      <p>
        Termite is the highest-ticket residential service and the most variable in pricing. The two
        product categories — liquid barriers and bait stations — have very different margin profiles.
      </p>

      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Owner price</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Liquid barrier (Termidor / Taurus / Premise)</td>
            <td>$8–$15 / linear ft</td>
            <td>$1,200–$2,200 typical home</td>
          </tr>
          <tr>
            <td>Spot treatment</td>
            <td>$300–$900</td>
            <td>1–2 active galleries</td>
          </tr>
          <tr>
            <td>Sentricon install</td>
            <td>$1,200–$3,000</td>
            <td>+ $300–$500/yr monitoring</td>
          </tr>
          <tr>
            <td>Termite renewal / warranty</td>
            <td>$150–$350 / yr</td>
            <td>Damage warranty extra</td>
          </tr>
          <tr>
            <td>WDO real-estate inspection</td>
            <td>$95–$200</td>
            <td>NPMA-33 / state form</td>
          </tr>
          <tr>
            <td>Tent fumigation (drywood)</td>
            <td>$1.25–$2.50 / sqft</td>
            <td>$1,500 minimum</td>
          </tr>
        </tbody>
      </table>

      <p>
        Termidor SC is around <strong>$248/jug</strong> at wholesale. Taurus SC has the same active
        ingredient (fipronil) and runs about <strong>$127/jug</strong>. Both work equally well — most
        owners use Termidor on jobs that include a damage warranty (BASF stands behind it) and Taurus
        on basic perimeter treatments.
      </p>

      <h2>Mosquito control pricing</h2>
      <ul>
        <li><strong>Recurring barrier spray (monthly, April–October):</strong> $65–$95 / treatment</li>
        <li><strong>In2Care station service:</strong> $20–$30 per station per visit</li>
        <li><strong>One-time event spray:</strong> $135–$275 (wedding, party prep)</li>
        <li><strong>Misting system installation:</strong> $2,000–$4,500 (~$100/nozzle)</li>
        <li><strong>Misting refill + annual service:</strong> $300–$650</li>
      </ul>
      <p>
        Mosquito is the highest-margin add-on you can sell to an existing GPC customer. Close rate on
        an in-truck upsell is typically <strong>20–30%</strong> once you've already built trust.
      </p>

      <h2>Rodent control and exclusion pricing</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rodent stations (exterior monitoring, 4 stations)</td>
            <td>$45–$75 / monthly service</td>
          </tr>
          <tr>
            <td>Interior trap setup + 2 follow-ups</td>
            <td>$275–$450</td>
          </tr>
          <tr>
            <td>Crawlspace / attic clean-out</td>
            <td>$650–$2,200</td>
          </tr>
          <tr>
            <td>Full exclusion bid (residential)</td>
            <td>$600–$2,500</td>
          </tr>
          <tr>
            <td>Commercial rodent program</td>
            <td>$95–$350 / month</td>
          </tr>
        </tbody>
      </table>

      <h2>Wildlife pricing (raccoon, squirrel, opossum, skunk, bats)</h2>
      <ul>
        <li><strong>Setup / inspection:</strong> $200–$400</li>
        <li><strong>Trap fee (per animal removed):</strong> $50–$200</li>
        <li><strong>Single-animal job total:</strong> $350–$600</li>
        <li><strong>Bat exclusion:</strong> $1,500–$8,000 depending on size and access</li>
      </ul>

      <h2>Commercial pricing (the higher-margin work)</h2>
      <p>
        Commercial monthly is where you build a stable, recession-resistant book. Pricing is per
        location, scaled to square footage and risk class.
      </p>

      <table>
        <thead>
          <tr>
            <th>Account type</th>
            <th>Monthly price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Small office / retail (under 3,000 sqft)</td>
            <td>$65–$110</td>
          </tr>
          <tr>
            <td>Restaurant / bar</td>
            <td>$135–$295</td>
          </tr>
          <tr>
            <td>Food processing / commercial kitchen</td>
            <td>$350–$1,200</td>
          </tr>
          <tr>
            <td>Warehouse (under 50k sqft)</td>
            <td>$175–$450</td>
          </tr>
          <tr>
            <td>Multifamily (per unit, monthly)</td>
            <td>$3.50–$8.00</td>
          </tr>
        </tbody>
      </table>

      <h2>How to actually set <em>your</em> prices</h2>
      <ol>
        <li>
          <strong>Calculate your hourly cost.</strong> Tech wage + payroll tax + vehicle + insurance ÷
          billable hours. For most one-truck owners that lands around{" "}
          <strong>$58–$85 / billable hour</strong>.
        </li>
        <li>
          <strong>Multiply by 3.</strong> That gives you your billable rate per hour. Most jobs should
          come out to <strong>3× your loaded labor cost</strong> to leave room for product, overhead,
          and profit.
        </li>
        <li>
          <strong>Check the chart above for sanity.</strong> If your math gives you $580 for a basic
          quarterly initial, you have a cost problem — not a pricing problem.
        </li>
        <li>
          <strong>Raise prices every 12 months.</strong> Industry standard is <strong>5–8%</strong>{" "}
          annual on recurring accounts. Most customers don't churn over a $7 quarterly increase.
        </li>
      </ol>

      <h2>The four jobs PCOs lose money on (and why)</h2>
      <ul>
        <li>
          <strong>German roaches under $300:</strong> Re-service eats the margin.
        </li>
        <li>
          <strong>Bed bug chemical "single room" jobs:</strong> Customer always says it's just one
          room. It almost never is.
        </li>
        <li>
          <strong>Single-stop mosquito treatments without a recurring upsell:</strong> Drive time
          kills it.
        </li>
        <li>
          <strong>WDO real-estate inspections priced below $125:</strong> Liability is too high for
          the fee.
        </li>
      </ul>

      <hr />

      <p>
        Want the customer-side perspective on pricing? Our{" "}
        <Link href="/blog/best-pest-control-software-for-small-business">small-business pest control software guide</Link>{" "}
        walks through what homeowners actually pay — useful for owners who want to benchmark against
        their own market. And when you're ready to build the actual paperwork, see our{" "}
        <Link href="/blog/pest-control-estimate-template">estimate template</Link> and{" "}
        <Link href="/blog/pest-control-invoice-template">invoice template</Link>.
      </p>
    </BlogLayout>
  );
}
