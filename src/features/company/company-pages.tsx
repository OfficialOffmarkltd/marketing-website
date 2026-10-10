import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import type { SubmissionScenario } from "@/data/demo/submission-scenarios";
import type { Policy } from "@/domain/catalog";
import { formatPublishedDate } from "@/domain/format";
import { ContactForm } from "@/features/forms/submission-forms";

export function AboutPage() {
  return (
    <>
      <Section>
        <Container className="about-hero">
          <PageHeading
            eyebrow="About Offmark"
            lead="A Nigerian fashion and technology company connecting clothing, creative tools, commerce and community."
          >
            Clothing, creativity and community.
          </PageHeading>
          <div
            className="company-media-placeholder"
            role="img"
            aria-label="Authentic Offmark company or process photography has not been supplied."
          >
            <span>Company photography pending</span>
          </div>
        </Container>
      </Section>
      <Section theme="dark" aria-labelledby="company-purpose-heading">
        <Container className="about-purpose-layout">
          <div>
            <p className="eyebrow">Our purpose</p>
            <h2 id="company-purpose-heading" className="text-section">
              Build useful spaces around fashion.
            </h2>
          </div>
          <p className="text-lead">
            Offmark brings its own clothing collections together with tools and
            services for fashion creation, commerce and community. Product
            claims and availability remain tied to published evidence.
          </p>
        </Container>
      </Section>
      <Section aria-labelledby="company-context-heading">
        <Container className="about-context-layout">
          <div>
            <p className="eyebrow">Nigeria</p>
            <h2 id="company-context-heading" className="text-section">
              Rooted here. Building outward.
            </h2>
          </div>
          <div>
            <p className="text-lead">
              The company is grounded in Nigerian fashion and creative context.
            </p>
            <p className="muted-copy">
              Approved team biographies, locations and company-history details
              have not been supplied, so this page does not invent them.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

export function ContactPage({
  demo = false,
  scenario = "success",
}: {
  demo?: boolean;
  scenario?: SubmissionScenario;
}) {
  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: this form makes no external submission.
          </Container>
        </div>
      )}
      <Section>
        <Container className="contact-layout">
          <div>
            <PageHeading
              eyebrow="Contact Offmark"
              lead="Use this space for company, product or collaboration enquiries once a verified destination is connected."
            >
              Start a conversation.
            </PageHeading>
            <p className="muted-copy">
              No public email address, phone number, office address or social
              contact has been approved for publication.
            </p>
          </div>
          <ContactForm
            mode={demo ? "demo" : "unavailable"}
            scenario={scenario}
          />
        </Container>
      </Section>
    </>
  );
}

export function PolicyPage({ policy }: { policy: Policy }) {
  return (
    <Section>
      <Container className="policy-page">
        <PageHeading
          eyebrow={`Effective ${formatPublishedDate(policy.effectiveAt)}`}
          lead={`Version ${policy.version}`}
        >
          {policy.title}
        </PageHeading>
        {policy.provenance.kind === "demo" && (
          <p className="alert">
            Fictional policy text for interface review. This is not an approved
            Offmark policy.
          </p>
        )}
        <div className="policy-body">
          <p>{policy.body}</p>
        </div>
      </Container>
    </Section>
  );
}
