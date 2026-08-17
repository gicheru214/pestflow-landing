import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function Privacy() {
  return (
    <LegalPageLayout
      eyebrow="Privacy Policy"
      title="PestFlow Privacy Policy"
      description="This policy explains how Reflectly AI, Inc. handles personal information when people visit PestFlow or use the PestFlow product."
    >
      <p>Effective date: August 17, 2026</p>

      <p>
        Reflectly AI, Inc. is a Texas-based company that operates PestFlow. PestFlow is a product
        name only and is not a separate legal entity or DBA.
      </p>

      <h2>Who controls your information</h2>
      <p>
        Reflectly AI, Inc. controls account, website, billing, and direct support information that
        it collects for its own purposes. When a PestFlow business customer enters information
        about its employees or customers, that business generally decides why and how the
        information is used, and Reflectly AI, Inc. processes it on the business&apos;s behalf. If
        your information was entered by a pest-control company, contact that company first; we
        will assist it with a valid request.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Contact details such as name, email address, phone number, and company name</li>
        <li>Account, workspace, subscription, and billing details needed to provide PestFlow</li>
        <li>
          Business and customer content, including scheduling, service, invoice, route, chemical,
          and job-related records
        </li>
        <li>Usage data such as page visits, device information, browser data, and referral source</li>
        <li>Messages, feedback, and other information submitted through support or onboarding</li>
      </ul>

      <h2>How and why we use information</h2>
      <ul>
        <li>Provide, maintain, secure, and improve PestFlow</li>
        <li>Create accounts and operate company workspaces</li>
        <li>Respond to support requests and communicate with customers</li>
        <li>Process subscriptions, trials, and related billing events</li>
        <li>Measure marketing performance and understand site and product usage</li>
        <li>Prevent fraud or abuse and comply with legal obligations</li>
      </ul>
      <p>
        Where European data-protection law applies, our legal bases may include performing a
        contract, complying with law, consent, and legitimate interests such as securing,
        supporting, and improving PestFlow. You may withdraw consent at any time where consent is
        the basis for processing.
      </p>

      <h2>Analytics and tracking</h2>
      <p>
        PestFlow may use analytics, advertising, and session-measurement tools to understand
        traffic, campaign performance, and product usage. Those providers may collect technical
        data such as IP address, browser type, device information, and page interactions. You may
        limit some cookie or tracking activity through your browser or device settings.
      </p>

      <h2>When we share information</h2>
      <p>We do not sell personal information. We may share information with:</p>
      <ul>
        <li>Authorized members of your PestFlow workspace</li>
        <li>Hosting, analytics, communications, support, and payment providers</li>
        <li>Authorities or other parties when required by law or needed to protect rights or safety</li>
        <li>A successor in connection with a merger, financing, acquisition, or sale of assets</li>
      </ul>

      <h2>How long we keep information</h2>
      <ul>
        <li>
          <strong>Active accounts and workspace content:</strong> while the account is active and
          as needed to provide PestFlow.
        </li>
        <li>
          <strong>Deleted accounts:</strong> personal information is deleted or de-identified from
          active systems within 30 days after a confirmed self-service deletion or verified
          request, except for the records described below.
        </li>
        <li>
          <strong>Backups:</strong> residual copies may remain in protected backups for up to 90
          days and are removed through normal backup rotation. They are not used for ordinary
          business purposes, and a deletion will be reapplied if a backup is restored.
        </li>
        <li>
          <strong>Billing, tax, and transaction records:</strong> up to 7 years, or longer where
          applicable law requires it.
        </li>
        <li>
          <strong>Security and access logs:</strong> up to 12 months, unless they are needed longer
          to investigate abuse, a security incident, or a legal claim.
        </li>
        <li>
          <strong>Support communications:</strong> up to 3 years after the request is closed.
        </li>
        <li>
          <strong>Marketing contacts:</strong> up to 24 months after the last interaction, or until
          an earlier opt-out or valid deletion request.
        </li>
      </ul>
      <p>
        We may retain limited information longer when necessary to meet a legal obligation,
        prevent fraud, resolve a dispute, or establish, exercise, or defend legal claims. We may
        keep information that has been irreversibly de-identified and can no longer reasonably be
        linked to a person.
      </p>

      <h2>Deleting your account or profile</h2>
      <p>
        In the PestFlow mobile app, open <strong>More</strong>, choose <strong>Delete Account</strong>,
        type <strong>DELETE</strong>, and confirm. Desktop users, former users, and anyone who cannot
        sign in may email{" "}
        <a href="mailto:support@pestflow.org?subject=Data%20deletion%20request">support@pestflow.org</a>{" "}
        from the account email with the subject “Data deletion request.” We may verify identity and
        authority before acting. See our <a href="/data-deletion">Data Deletion Policy</a> for the
        complete process and important information about shared workspaces and subscriptions.
      </p>

      <h2>Your privacy rights</h2>
      <p>
        Depending on where you live, you may request access, correction, deletion, restriction,
        objection, or portability of personal information, and may withdraw consent. You may also
        complain to your local data-protection authority. We answer valid GDPR rights requests
        without undue delay and generally within one month. A complex request may take up to two
        additional months where the law permits; if so, we will explain the extension within the
        first month.
      </p>

      <h2>Security</h2>
      <p>
        We use reasonable administrative, technical, and organizational safeguards designed to
        protect information. No transmission or storage method is completely secure, so we cannot
        guarantee absolute security.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        PestFlow is intended for business use and is not directed to children under 13. We do not
        knowingly collect personal information from children under 13.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will revise the effective date and provide
        additional notice when required by law.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy or deletion requests, email <a href="mailto:support@pestflow.org">support@pestflow.org</a>.
      </p>
    </LegalPageLayout>
  );
}
