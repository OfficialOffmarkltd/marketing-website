import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Badge, EmptyState } from "@/components/ui/feedback";
import type { SubmissionScenario } from "@/data/demo/submission-scenarios";
import type { Service } from "@/domain/catalog";
import { CollectionMedia } from "@/features/collections/media";
import { WaitlistForm } from "@/features/forms/submission-forms";

const availabilityLabels: Record<Service["availability"], string> = {
  live: "Live",
  beta: "Beta",
  in_development: "In development",
  unconfirmed: "Availability unconfirmed",
};

function ServiceState({ service }: { service?: Service }) {
  return (
    <div className="service-state">
      <Badge>
        {service ? availabilityLabels[service.availability] : "Details pending"}
      </Badge>
      {service?.provenance.kind === "demo" && (
        <span className="demo-label">Fictional preview</span>
      )}
    </div>
  );
}

function ServiceAction({ service }: { service?: Service }) {
  if (service?.destination && service.availability !== "unconfirmed") {
    return (
      <a className="button button-primary" href={service.destination}>
        Open {service.name}
      </a>
    );
  }
  return null;
}

export function SeamPage({
  service,
  scenario = "success",
}: {
  service?: Service;
  scenario?: SubmissionScenario;
}) {
  const demo = service?.provenance.kind === "demo";
  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: workflow, features and availability are
            fictional.
          </Container>
        </div>
      )}
      <Section className="service-hero-section">
        <Container className="service-hero">
          <div>
            <PageHeading
              eyebrow="Seam by Offmark"
              lead={
                service?.summary ??
                "A standalone fashion design platform from Offmark."
              }
            >
              Give your ideas a place to take shape.
            </PageHeading>
            <ServiceState service={service} />
            <ServiceAction service={service} />
          </div>
          <CollectionMedia
            asset={service?.screenshot}
            label="Seam editor view"
            ratio="landscape"
            priority
          />
        </Container>
      </Section>
      <Section
        aria-labelledby="seam-workflow-heading"
        className="service-workflow-section"
      >
        <Container>
          <div className="collection-section-heading">
            <p className="eyebrow">Create with Seam</p>
            <h2 id="seam-workflow-heading" className="text-section">
              A fashion-first workflow.
            </h2>
          </div>
          {demo ? (
            <ol className="service-step-grid">
              <li>
                <span>01</span>
                <h3 className="heading-card">Start with an idea</h3>
                <p>
                  Fictional workflow copy for reviewing how a project begins.
                </p>
              </li>
              <li>
                <span>02</span>
                <h3 className="heading-card">Shape the design</h3>
                <p>
                  Fictional workflow copy for reviewing visual design decisions.
                </p>
              </li>
              <li>
                <span>03</span>
                <h3 className="heading-card">Prepare direction</h3>
                <p>
                  Fictional workflow copy for reviewing an outcome and next
                  steps.
                </p>
              </li>
            </ol>
          ) : (
            <EmptyState title="Workflow evidence is being prepared.">
              <p>
                The real editor workflow will be published with authenticated
                product screenshots.
              </p>
            </EmptyState>
          )}
        </Container>
      </Section>
      <Section theme="orange" aria-labelledby="seam-features-heading">
        <Container className="service-evidence-layout">
          <div>
            <p className="eyebrow">Product evidence</p>
            <h2 id="seam-features-heading" className="text-section">
              Show the work, then make the claim.
            </h2>
          </div>
          <div>
            {demo ? (
              <ul className="service-feature-list">
                <li>
                  <strong>Visual workspace</strong>
                  <span>Fictional feature placeholder.</span>
                </li>
                <li>
                  <strong>Fashion-specific direction</strong>
                  <span>Fictional feature placeholder.</span>
                </li>
                <li>
                  <strong>Shareable design output</strong>
                  <span>Fictional feature placeholder.</span>
                </li>
              </ul>
            ) : (
              <p className="text-lead">
                Confirmed features will appear here with real interface
                evidence.
              </p>
            )}
          </div>
        </Container>
      </Section>
      <Section aria-labelledby="seam-audience-heading">
        <Container className="service-audience-layout">
          <div>
            <p className="eyebrow">Who it serves</p>
            <h2 id="seam-audience-heading" className="text-section">
              Built around fashion ideas.
            </h2>
          </div>
          <div>
            <p className="text-lead">
              Audience details and access requirements will be confirmed before
              launch.
            </p>
            {demo && (
              <div className="service-waitlist-block">
                <h3 className="heading-card">Preview the waitlist state</h3>
                <WaitlistForm
                  serviceId={service.id}
                  mode="demo"
                  scenario={scenario}
                />
              </div>
            )}
          </div>
        </Container>
      </Section>
      <Section
        aria-labelledby="seam-faq-heading"
        className="service-faq-section"
      >
        <Container className="drop-faq-layout">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2 id="seam-faq-heading" className="text-section">
              About Seam.
            </h2>
          </div>
          <div className="drop-faq-list">
            <details>
              <summary>Is Seam part of the collection store?</summary>
              <p>
                No. Seam is a standalone fashion design platform presented by
                Offmark.
              </p>
            </details>
            <details>
              <summary>Can I use the editor on this page?</summary>
              <p>
                No. This website explains Seam; it does not imitate or embed a
                fake editor.
              </p>
            </details>
            <details>
              <summary>When is Seam available?</summary>
              <p>
                {service?.availability === "unconfirmed" || !service
                  ? "Availability has not been confirmed."
                  : `The current labelled status is ${availabilityLabels[service.availability]}.`}
              </p>
            </details>
          </div>
        </Container>
      </Section>
    </>
  );
}

function PlatformService({
  service,
  title,
  scenario,
}: {
  service?: Service;
  title: "Marketplace" | "Drip";
  scenario: SubmissionScenario;
}) {
  const demo = service?.provenance.kind === "demo";
  const isMarketplace = title === "Marketplace";
  return (
    <Section
      aria-labelledby={`${title.toLowerCase()}-heading`}
      className="platform-service-section"
    >
      <Container
        className={`platform-service-layout${isMarketplace ? "" : " platform-service-reversed"}`}
      >
        <CollectionMedia
          asset={service?.screenshot}
          label={`${title} product view`}
          ratio="landscape"
        />
        <div className="platform-service-copy">
          <p className="eyebrow">{title}</p>
          <h2 id={`${title.toLowerCase()}-heading`} className="text-section">
            {isMarketplace
              ? "A place for fashion commerce."
              : "A social space shaped around fashion."}
          </h2>
          <p className="text-lead">
            {service?.summary ??
              (isMarketplace
                ? "Offmark's broader fashion commerce service."
                : "Offmark's fashion social and community service.")}
          </p>
          <ServiceState service={service} />
          <ServiceAction service={service} />
          {demo && (
            <div className="service-waitlist-block">
              <h3 className="heading-card">Preview the waitlist state</h3>
              <WaitlistForm
                serviceId={service.id}
                mode="demo"
                scenario={scenario}
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

export function PlatformPage({
  services,
  scenario = "success",
}: {
  services: Service[];
  scenario?: SubmissionScenario;
}) {
  const marketplace = services.find(
    (service) => service.slug === "marketplace",
  );
  const drip = services.find((service) => service.slug === "drip");
  const demo = services.some((service) => service.provenance.kind === "demo");
  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: service statuses and waitlists are fictional.
          </Container>
        </div>
      )}
      <Section>
        <Container>
          <PageHeading
            eyebrow="The Offmark platform"
            lead="Marketplace and Drip are distinct commerce and community services. Their final packaging remains unconfirmed."
          >
            More ways to participate in fashion.
          </PageHeading>
        </Container>
      </Section>
      <PlatformService
        service={marketplace}
        title="Marketplace"
        scenario={scenario}
      />
      <PlatformService service={drip} title="Drip" scenario={scenario} />
    </>
  );
}
