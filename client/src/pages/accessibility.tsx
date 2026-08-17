import { LegalPageLayout } from "@/components/layout/legal-page-layout";

export default function Accessibility() {
  return (
    <LegalPageLayout
      eyebrow="Accessibility"
      title="PestFlow Accessibility Statement"
      description="Reflectly AI, Inc. is committed to making the PestFlow website usable by people with disabilities and to providing an accessible way to get help."
    >
      <p>Last reviewed: August 17, 2026</p>

      <h2>Our accessibility goal</h2>
      <p>
        We use the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA as our current
        technical target for the PestFlow website. Accessibility is an ongoing process, and this
        statement does not represent a certification that every page or third-party service is
        free of barriers.
      </p>

      <h2>Measures we take</h2>
      <p>Our website work includes efforts to provide:</p>
      <ul>
        <li>Keyboard access and visible focus indicators for interactive controls</li>
        <li>Meaningful page structure, headings, landmarks, labels, and image alternatives</li>
        <li>Text and controls with readable color contrast</li>
        <li>Support for browser zoom, text resizing, and responsive page reflow</li>
        <li>Reduced-motion behavior for people who request it in their device settings</li>
        <li>Clear form instructions and programmatically identified validation errors</li>
      </ul>

      <h2>Third-party content</h2>
      <p>
        Some pages may include third-party services such as chat, video, scheduling, analytics, or
        app-store content. We do not control every accessibility feature of those services. If a
        third-party component creates a barrier, contact us and we will provide the information or
        service through an accessible alternative when reasonably possible.
      </p>

      <h2>Get assistance or report a barrier</h2>
      <p>
        If you have difficulty using the PestFlow website, need information in another format, or
        want to report an accessibility issue, email{" "}
        <a href="mailto:support@pestflow.org?subject=Accessibility%20request">
          support@pestflow.org
        </a>
        . Please include the page address, a short description of the problem, and your preferred
        way for us to respond. Information about your browser or assistive technology is helpful
        but optional.
      </p>
      <p>
        We will acknowledge accessibility requests as soon as reasonably possible and work with
        you to provide access or an effective alternative.
      </p>

      <h2>Ongoing review</h2>
      <p>
        We review accessibility during design and development, test representative keyboard and
        responsive workflows, and use feedback to prioritize corrections. Because the site and
        supporting services change over time, we will continue to monitor and improve them.
      </p>
    </LegalPageLayout>
  );
}
