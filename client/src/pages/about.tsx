import { Link } from "wouter";
import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function About() {
  return (
    <LegalPageLayout
      eyebrow="About us"
      title="About PestFlow"
      description="PestFlow helps pest control businesses manage their work and customer relationships in one place."
    >
      <h2>What we do</h2>
      <p>
        PestFlow provides software for scheduling, dispatch, customer management, invoicing,
        and technician workflows. Businesses use it to organize day-to-day service and keep
        customers informed about their appointments.
      </p>

      <h2>Who operates PestFlow</h2>
      <p>
        PestFlow is a product operated by Reflectly AI, Inc., a Texas-based company.
      </p>

      <h2>Get in touch</h2>
      <p>
        Visit our <Link href="/contact">contact page</Link> or email
        {" "}<a href="mailto:support@pestflow.org">support@pestflow.org</a>.
      </p>
    </LegalPageLayout>
  );
}
