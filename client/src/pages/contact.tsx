import { Link } from "wouter";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function Contact() {
  return (
    <LegalPageLayout
      eyebrow="Contact"
      title="Contact PestFlow"
      description="Reach the PestFlow team for product, account, billing, or onboarding help."
    >
      <h2>Email our team</h2>
      <p>
        Send your question to <a href="mailto:support@pestflow.org">support@pestflow.org</a>.
        Include your company name and the email tied to your PestFlow account so we can
        find the right account and help you faster.
      </p>

      <h2>Company information</h2>
      <p>
        PestFlow is operated by Reflectly AI, Inc., a Texas-based company.
        You can find more detail on our <Link href="/about">About page</Link> and
        additional help on our <Link href="/support">Support page</Link>.
      </p>
    </LegalPageLayout>
  );
}
