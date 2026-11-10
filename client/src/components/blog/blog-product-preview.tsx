const jobDetailPreview = {
  file: "pestflow-job-detail.jpg",
  alt: "PestFlow mobile Job Detail screen with clock-in and job documentation tabs",
  heading: "A work order in PestFlow",
  caption:
    "This is the Job Detail screen technicians open in the field. It brings job information, documents, products, and billing into the same record.",
  width: 444,
  height: 960,
};

const estimatePreview = {
  file: "pestflow-estimate-form.jpg",
  alt: "PestFlow sample estimate form with a monthly plan, price, scope, and number of visits",
  heading: "An estimate in PestFlow",
  caption:
    "This sample estimate shows how to name a service plan and set its price, included work, and number of visits.",
  width: 390,
  height: 844,
};

const dashboardPreview = {
  file: "pestflow-mobile-dashboard.jpg",
  alt: "PestFlow mobile dashboard showing today's schedule and shortcuts for jobs and invoices",
  heading: "A small team's dashboard in PestFlow",
  caption:
    "The mobile dashboard shows today's schedule and gives owners quick access to jobs, customer records, invoices, and signatures.",
  width: 444,
  height: 960,
};

const productPreviews = new Map([
  ["pest-control-work-order-software", jobDetailPreview],
  ["best-mobile-app-for-pest-control-technicians", jobDetailPreview],
  ["pest-control-technician-mobile-app", jobDetailPreview],
  ["pest-technician-workflow-guide", jobDetailPreview],
  ["improve-pest-technician-accountability", jobDetailPreview],
  ["pest-control-service-report-software", jobDetailPreview],
  ["pest-control-estimating-software", estimatePreview],
  ["pest-control-estimate-template", estimatePreview],
  ["pest-control-estimating-quoting-and-esignature-software", estimatePreview],
  ["streamline-recurring-pest-service", estimatePreview],
  ["best-pest-control-software-for-small-business", dashboardPreview],
  ["pest-control-scheduling-software", dashboardPreview],
  ["pest-control-scheduling-that-protects-routes", dashboardPreview],
  ["pest-control-software-for-owner-operators", dashboardPreview],
  ["pest-control-software-for-startups", dashboardPreview],
]);

export function hasBlogProductPreview(slug: string) {
  return productPreviews.has(slug);
}

export function BlogProductPreview({ slug }: { slug: string }) {
  const preview = productPreviews.get(slug);
  if (!preview) return null;

  const src = "/assets/blog/" + preview.file;

  return (
    <figure
      data-pestflow-product-preview={slug}
      className="not-prose my-5 grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"Open full size: " + preview.alt}
      >
        <img
          src={src}
          alt={preview.alt}
          width={preview.width}
          height={preview.height}
          decoding="async"
          className="block h-auto w-full rounded-md border bg-white"
        />
      </a>
      <figcaption className="text-sm leading-relaxed text-emerald-950">
        <strong className="mb-1 block text-base">{preview.heading}</strong>
        {preview.caption}
      </figcaption>
    </figure>
  );
}
