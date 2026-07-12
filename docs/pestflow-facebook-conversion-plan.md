# PestFlow Facebook conversion plan

## Decision

Ship **Guided Concierge** as the first challenger. It combines the parts that actually worked across both products:

- WrenchFlow's campaign-to-headline message match
- WrenchFlow's low-friction routing question before contact capture
- PestFlow's unique ability to take a real $1 self-serve payment
- a visible 15-minute human setup path for buyers who need trust before checkout
- concrete product and billing proof instead of an unrelated lead magnet

Do not run ten live variants. The conversion lab uses ten concepts to make the strategy legible; the live experiment should compare one selected challenger with the current control.

## What the evidence says

### Clean PestFlow baseline

For May 15 through July 11, after removing known internal and Codex QA visitor identities:

| Step | Unique visitors | Rate |
| --- | ---: | ---: |
| Landing page view | 1,442 | 100% |
| Popup shown | 1,269 | 88.0% of landing visitors |
| Popup submitted | 17 | 1.34% of popup viewers |
| Popup submitted | 17 | 1.18% of landing visitors |

The main leak is after the popup appears. Traffic volume matters, but increasing traffic into the current 1.18% capture path will multiply waste.

### What WrenchFlow did better

The campaign-era WrenchFlow code, reviewed near commits `f00fcf9`, `a5fe397`, `4555ec8`, and `d343448`, had four structural advantages:

1. The hero changed with UTM campaign/content signals. Route, invoice, mobile mechanic, tire-shop, and scheduling traffic did not all receive the same generic headline.
2. The popup first asked a simple routing question such as owner versus technician.
3. The popup was immediately dismissible.
4. Qualified visitors could reach a calendar without first downloading the product.

WrenchFlow is not an unquestioned conversion model. It produced 49 schedules from 429 landing-page views (11.4%) during April 7-May 14, then zero schedules from 358 landing-page views during May 15-June 10. The lesson is to borrow its strongest structure, not copy its entire page or assume its later funnel stayed healthy.

### What PestFlow already does better

PestFlow has produced real $1 self-serve payments. That is a more valuable bottom-of-funnel signal than a scheduled call by itself. The redesign must preserve self-serve checkout as a first-class path rather than turning the site into a demo-only funnel.

## Root causes on the current page

1. **The popup arrives before trust.** It appears after roughly one second and a first-time visitor initially cannot close it.
2. **The offer does not match the ad or product.** “The $1M Pest Control Playbook” sounds like a marketing lead magnet while the visitor clicked to evaluate operating software.
3. **The form asks for too much too early.** Full name, phone, and email are required before the visitor sees personalized value. Required phone fields create privacy concerns when the reason is unclear; Baymard recommends removing, making optional, or explaining the field ([research](https://baymard.com/blog/explain-phone-number-field)).
4. **The page claims before it proves.** Unsupported-looking revenue numbers, ratings, and anonymous-style testimonials deepen the trust gap.
5. **The real product is not the first proof.** A cold visitor should see a recognizable route, billing, or field workflow in the first screen.
6. **The calendar is too late.** A visitor who wants reassurance must travel farther into the product journey than a self-serve buyer.
7. **Every Meta creative lands on nearly the same promise.** This loses the message continuity WrenchFlow had.
8. **The landing shell emits app events.** `Login` and `App Opened` on a public marketing page make product analytics harder to interpret.

## Winning page structure

### Above the fold

- Product-specific eyebrow: “One question. One real PestFlow workflow.”
- Headline: “Fix the workflow slowing your team down.”
- Body: “Choose the problem. See the exact PestFlow screen that solves it. Then test the real product for $1 or book a 15-minute setup map.”
- Primary action: “Show me the right workflow”
- Secondary action: “Book a 15-minute setup”
- Immediate trust line: “$1 today · 7-day trial · Cancel before renewal · Real human setup available”
- A legible product preview showing route stops, exceptions, and money ready to collect

### Popup behavior

Keep the popup, but change its job from **contact wall** to **product concierge**.

Trigger rules for the challenger:

- show after nine seconds, not one second
- show only once per session
- make Close available immediately
- suppress automatic opening if the visitor already chose a hero action
- optionally add desktop exit-intent later, but do not rely on it for mobile Meta traffic

Step 1, no form:

> What is creating the most drag this week?

- Routes keep changing
- Billing takes too much follow-up
- The office cannot see the field
- Switching software feels risky

Step 2, value before capture:

- show the relevant PestFlow workflow
- explain why it matches the answer
- ask for email only to save the setup link
- keep phone optional and explain that it is used only if setup help is requested

Step 3, two legitimate paths:

- “Start my $1 test”
- “Book setup instead”

### Calendar placement

Move calendar **access** forward, not a large embedded calendar above the product.

- “Book setup” in the top navigation
- “Book a 15-minute setup” beside the hero CTA
- immediate scheduling option inside the popup
- inline scheduler after product proof for visitors who continue scrolling

This avoids forcing every visitor into sales while making a person available before app download. Calendly supports inline, popup, and routing-based scheduling; the useful principle here is to reveal times immediately after qualification, not to make the calendar the hero ([embedding guidance](https://calendly.com/blog/embed-scheduling-website), [routing guidance](https://calendly.com/blog/routing/)).

### Campaign message matching

Update Meta destination URLs with a stable intent value. Keep standard UTMs as well.

| Ad promise | Landing parameter | Matched hero |
| --- | --- | --- |
| Route/dispatch | `intent=routes` | “Tomorrow's route, under control.” |
| Billing/payment | `intent=billing` | “Close the job. Close the payment loop.” |
| Field visibility | `intent=field` | “See every truck. Stop chasing updates.” |
| Migration/switching | `intent=switching` | “Switch systems. Keep the week running.” |

Example:

```text
https://pestflow.org/?intent=routes&utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

Do not rely on numeric Meta content IDs inside the page. The explicit `intent` value is a stable contract the landing page can understand.

## Ten concepts and scorecard

Weights: message match 25, trust before capture 20, product proof 20, low friction 15, self-serve preservation 10, human-assist path 10.

| Rank | Concept | Score | Best use |
| ---: | --- | ---: | --- |
| 1 | Guided Concierge | 95 | Mixed cold Meta traffic; selected challenger |
| 2 | $1 Product Proof | 90 | High-intent retargeting and pricing traffic |
| 3 | Route Board Live | 89 | Route/dispatch ad sets |
| 4 | Demo Before Form | 88 | Visual comparison shoppers |
| 4 | Trust Ledger | 88 | Skeptical retargeting traffic |
| 6 | Chaos to Control | 85 | Owner-operators using texts and spreadsheets |
| 7 | Switch With Confidence | 84 | Competitor and migration campaigns |
| 7 | Small Team Command | 84 | Two-to-ten truck teams |
| 9 | Operator Scorecard | 83 | Problem-aware, low product-awareness traffic |
| 10 | Growth Control Room | 76 | Established multi-route operators; too narrow for the first test |

The winner should borrow two supporting modules from other concepts:

- the transparent renewal/cancellation ledger from **$1 Product Proof / Trust Ledger**
- the concrete route-board visual from **Route Board Live**

## Measurement plan

### Funnel events

Use one definition per event and segment every report by campaign intent and device:

1. `landing_view`
2. `popup_shown` with `trigger = timer | exit | cta`
3. `popup_problem_selected` with the selected problem
4. `workflow_preview_viewed`
5. `email_captured`
6. `calendar_opened`
7. `calendar_booked`
8. `checkout_started`
9. `one_dollar_payment_completed`

The primary landing KPI is:

```text
(email_captured + calendar_booked + one_dollar_payment_completed) / unique landing visitors
```

Report the three outcomes separately as well. A booked call, email lead, and paid self-serve customer are not economically identical.

### Experiment design

- Control: current production page
- Challenger: Guided Concierge
- Split: 50/50 by stable visitor ID
- Minimum: 500 unique visitors per arm and at least 45 days
- Guardrails: checkout error rate, calendar no-show rate, mobile bounce, duplicate leads, and paid-customer conversion
- Do not declare a winner from popup clicks alone
- Do not run a ten-way live test at current traffic volume

If volume makes a statistically decisive payment result slow, use problem-selection and workflow-preview progression as diagnostic signals, but keep the final decision anchored to captured leads, booked calls, and $1 payments.

## Trust cleanup before production

- Remove any revenue lift, rating, or customer quote that cannot be traced to a real source and approved for publication.
- Show the legal company identity, working support path, cancellation route, renewal date, renewal price, and export promise together.
- Use real product captures or a clearly labeled interactive sample.
- Keep “$1 today” beside “what happens on day 8.”
- Replace the current negative “No” wording with a neutral close/dismiss choice.

## Staging and rollout gates

1. All ten concepts render on desktop and mobile.
2. The selected popup is immediately dismissible and completes routing, recommendation, email, and calendar states.
3. Localhost, Railway staging, and `/conversion-lab` load none of the production analytics, replay, chat, or ad scripts.
4. All forms and calendar slots in the concept lab remain non-submitting.
5. The Railway staging URL is verified independently from production.
6. Only after approval, wire real checkout, Calendly, and analytics events into the selected challenger.
7. Production remains unchanged until the challenger passes those gates.
