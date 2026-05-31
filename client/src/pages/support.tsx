import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function Support() {
  return (
    <LegalPageLayout
      eyebrow="Support"
      title="PestFlow Support"
      description="Need help with PestFlow? This page is the public support resource for the PestFlow product operated by Reflectly AI, Inc."
    >
      <h2>How to reach us</h2>
      <p>
        PestFlow is a software product operated by Reflectly AI, Inc., a Texas-based company.
        If you need product help, account help, billing help, or assistance during onboarding,
        please contact our team at <a href="mailto:support@pestflow.org">support@pestflow.org</a>.
      </p>

      <h2>What we can help with</h2>
      <ul>
        <li>Account access and onboarding questions</li>
        <li>Subscription, billing, and trial support</li>
        <li>Routing, scheduling, invoicing, and technician workflow questions</li>
        <li>Bug reports, feature requests, and product feedback</li>
      </ul>

      <h2>Response expectations</h2>
      <p>
        We aim to respond as quickly as possible during normal business hours. When you contact
        support, include your company name, the email tied to your PestFlow account, and a short
        description of the issue so we can help faster.
      </p>

      <h2>Company information</h2>
      <p>
        Legal entity: Reflectly AI, Inc.
        <br />
        Product name: PestFlow
        <br />
        Jurisdiction: Texas, United States
      </p>
    </LegalPageLayout>
  );
}
