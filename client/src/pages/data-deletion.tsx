import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function DataDeletion() {
  return (
    <LegalPageLayout
      eyebrow="Data Deletion Policy"
      title="Delete your PestFlow data"
      description="How to delete a PestFlow account or profile, what the request covers, and when remaining copies are removed."
    >
      <p>Effective date: August 17, 2026</p>

      <h2>How to request deletion</h2>
      <ol>
        <li>
          <strong>In the mobile app:</strong> open <strong>More</strong>, choose{" "}
          <strong>Delete Account</strong>, type <strong>DELETE</strong>, and confirm.
        </li>
        <li>
          <strong>By email:</strong> email{" "}
          <a href="mailto:support@pestflow.org?subject=Data%20deletion%20request">support@pestflow.org</a>{" "}
          from the email connected to the account. Use the subject “Data deletion request” and
          include the account email and company name. Do not send a password or full payment-card
          details.
        </li>
      </ol>
      <p>
        If you cannot email from the account address, explain why and provide another way for us to
        verify you. We may ask for information reasonably needed to confirm identity and authority.
      </p>

      <h2>Personal profiles and shared workspaces</h2>
      <p>
        A team member may request deletion of their own login, profile, and workspace access. Only
        an authorized workspace owner may request deletion of an entire company workspace. Some
        job, invoice, chemical, compliance, customer, or audit records belong to the business that
        created them and may remain in its workspace after an individual team member is removed.
        If a PestFlow business customer entered your information, contact that business first; it
        generally controls the record, and PestFlow will assist it with a valid request.
      </p>

      <h2>What happens after a request</h2>
      <ul>
        <li>A successful self-service deletion ends access to the deleted account.</li>
        <li>
          We delete or irreversibly de-identify covered personal information in active systems
          within 30 days after a confirmed self-service deletion or verified email request.
        </li>
        <li>
          Protected backup copies may remain for up to 90 days until normal backup rotation removes
          them. Backups are not used for ordinary business purposes, and deletion is reapplied if a
          backup is restored.
        </li>
        <li>
          Irreversibly de-identified information that can no longer reasonably identify a person
          may be retained.
        </li>
      </ul>

      <h2>Information we may need to keep</h2>
      <p>
        Deletion is not absolute when applicable law permits or requires retention. We may keep
        limited billing, tax, transaction, fraud-prevention, security, dispute, and legal-claim
        records. Billing and tax records may be retained for up to 7 years; security logs may be
        retained for up to 12 months, or longer if tied to an active incident or claim. We will
        restrict retained information to the purpose that requires it.
      </p>

      <h2>Subscriptions and third parties</h2>
      <p>
        Before deleting an account, cancel any active subscription or ask support to confirm its
        status. Account deletion does not erase charges already incurred. Payment processors and
        other third parties may retain information under their own legal obligations and privacy
        policies, and a separate request to them may be required.
      </p>

      <h2>Response time</h2>
      <p>
        We generally complete verified deletion requests within 30 days. GDPR requests are answered
        without undue delay and within one month. Where permitted for a complex or numerous
        request, we may extend that period by up to two additional months and will explain the
        extension within the first month.
      </p>

      <h2>Questions or appeals</h2>
      <p>
        Email <a href="mailto:support@pestflow.org">support@pestflow.org</a>. If we cannot fulfill
        all or part of a request, we will explain the applicable reason unless the law prevents us
        from doing so.
      </p>
    </LegalPageLayout>
  );
}
