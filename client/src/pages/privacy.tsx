import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function Privacy() {
  return (
    <LegalPageLayout
      eyebrow="Privacy Policy"
      title="PestFlow Privacy Policy"
      description="This policy explains how Reflectly AI, Inc. handles information when people visit PestFlow marketing pages or use the PestFlow product."
    >
      <p>Effective date: May 30, 2026</p>

      <p>
        Reflectly AI, Inc. is a Texas-based company that operates the PestFlow product. PestFlow is
        a product name only and is not a separate legal entity or DBA.
      </p>

      <h2>Information we collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>Contact details such as name, email address, phone number, and company name</li>
        <li>Account and billing details needed to provide the product</li>
        <li>Usage data such as page visits, device information, browser data, and referral source</li>
        <li>Customer-submitted content entered into forms, onboarding flows, or product features</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Provide, maintain, and improve PestFlow</li>
        <li>Respond to support requests and communicate with customers</li>
        <li>Process subscriptions, trials, and related billing events</li>
        <li>Measure marketing performance and understand site usage</li>
        <li>Protect the service, prevent abuse, and comply with legal obligations</li>
      </ul>

      <h2>Analytics and tracking</h2>
      <p>
        PestFlow may use analytics, advertising, and session measurement tools to understand
        traffic, campaign performance, and product usage. Those providers may collect technical data
        such as IP address, browser type, device information, and page interactions.
      </p>

      <h2>When we share information</h2>
      <p>
        We may share information with service providers who help us operate PestFlow, including
        hosting, analytics, communications, and payment providers. We may also disclose information
        when required by law, to protect rights or safety, or in connection with a merger,
        financing, or sale of assets.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain information for as long as reasonably necessary to provide the service, support
        customers, comply with legal obligations, resolve disputes, and enforce agreements.
      </p>

      <h2>Your choices</h2>
      <p>
        You may contact us to request access, correction, or deletion of certain personal
        information, subject to applicable law. You can also limit some cookie or tracking activity
        through your browser settings.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy questions, email <a href="mailto:support@pestflow.org">support@pestflow.org</a>.
      </p>
    </LegalPageLayout>
  );
}
