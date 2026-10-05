import { Container, Section } from "@/components/layout/primitives";
import { Badge, EmptyState } from "@/components/ui/feedback";
import { ActionLink } from "@/components/ui/link";
import type { BuildUpdate, Design, Drop, Service } from "@/domain/catalog";
import { formatMoney, formatPublishedDate } from "@/domain/format";

export type HomepageProps = {
  services: Service[];
  currentDrop: Drop | null;
  featuredDesigns: Design[];
  updates: BuildUpdate[];
};

const availabilityLabels: Record<Service["availability"], string> = {
  live: "Live",
  beta: "Beta",
  in_development: "In development",
  unconfirmed: "Availability unconfirmed",
};

function MediaPlaceholder({
  label,
  detail,
  tone = "light",
  ratio = "portrait",
}: {
  label: string;
  detail: string;
  tone?: "light" | "dark";
  ratio?: "portrait" | "landscape";
}) {
  return (
    <div
      className={`home-media-placeholder home-media-${tone} home-media-${ratio}`}
      role="img"
      aria-label={`${label}. ${detail}`}
    >
      <span className="home-media-mark" aria-hidden="true">
        M
      </span>
      <div>
        <p className="text-label">{label}</p>
        <p className="text-metadata">{detail}</p>
      </div>
    </div>
  );
}

function DemoLabel({ provenance }: { provenance: Design["provenance"] }) {
  if (provenance.kind !== "demo") return null;
  return <span className="demo-label">Fictional preview</span>;
}

function ProductCard({ design, drop }: { design: Design; drop: Drop }) {
  return (
    <article className="home-product-card">
      <div
        className="home-product-image"
        role="img"
        aria-label={`Image pending for ${design.name}`}
      >
        <span aria-hidden="true">Image pending</span>
      </div>
      <div className="home-product-copy">
        <div className="home-card-meta">
          <Badge>
            {drop.status === "closing" ? "Closing" : "Preorders open"}
          </Badge>
          <DemoLabel provenance={design.provenance} />
        </div>
        <h3 className="heading-card">{design.name}</h3>
        <p>{design.price ? formatMoney(design.price) : "Price unavailable"}</p>
        <p className="text-metadata">{drop.name}</p>
      </div>
    </article>
  );
}

function CurrentDrop({
  drop,
  designs,
}: {
  drop: Drop | null;
  designs: Design[];
}) {
  return (
    <Section id="collections" aria-labelledby="collections-heading">
      <Container>
        <div className="home-section-intro">
          <div>
            <p className="eyebrow">Offmark collections</p>
            <h2 id="collections-heading" className="text-section">
              Designed first.
              <br />
              Made for you.
            </h2>
          </div>
          <div>
            <p className="text-lead">
              We release original designs and make them against demand through
              preorders.
            </p>
            <ActionLink href="/collections" variant="text">
              Explore collections <span aria-hidden="true">↗</span>
            </ActionLink>
          </div>
        </div>

        {drop && designs.length > 0 ? (
          <div className="home-drop-block">
            <div className="home-drop-heading">
              <div>
                <p className="text-metadata">Featured drop</p>
                <h3 className="heading-card">{drop.name}</h3>
              </div>
              {drop.provenance.kind === "demo" && (
                <span className="demo-label">Fictional collection preview</span>
              )}
            </div>
            <div className="home-product-grid">
              {designs.slice(0, 3).map((design) => (
                <ProductCard key={design.id} design={design} drop={drop} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="The next collection starts here."
            action={
              <ActionLink href="/collections">Visit collections</ActionLink>
            }
          >
            <p>
              No collection has been published yet. New designs and preorder
              details will appear here when they are confirmed.
            </p>
          </EmptyState>
        )}
      </Container>
    </Section>
  );
}

function ServiceStatus({ service }: { service?: Service }) {
  return (
    <div className="home-service-status">
      <Badge>
        {service ? availabilityLabels[service.availability] : "Details pending"}
      </Badge>
      {service?.provenance.kind === "demo" && (
        <span className="demo-label">Fictional preview</span>
      )}
    </div>
  );
}

function SeamFeature({ service }: { service?: Service }) {
  return (
    <Section theme="orange" aria-labelledby="seam-heading">
      <Container className="home-split home-seam-layout">
        <div className="home-feature-copy">
          <p className="eyebrow">Seam by Offmark</p>
          <h2 id="seam-heading" className="text-section">
            Give your ideas a place to take shape.
          </h2>
          <p className="text-lead measure">
            Seam is a standalone fashion design platform for turning clothing
            ideas into visual direction.
          </p>
          <ServiceStatus service={service} />
          <ActionLink href="/seam" variant="dark">
            Discover Seam
          </ActionLink>
        </div>
        <MediaPlaceholder
          label="Seam editor view pending"
          detail="Supply an authentic product screenshot before launch."
          tone="dark"
          ratio="landscape"
        />
      </Container>
    </Section>
  );
}

function PlatformRow({
  service,
  title,
  heading,
  body,
  reversed = false,
}: {
  service?: Service;
  title: string;
  heading: string;
  body: string;
  reversed?: boolean;
}) {
  return (
    <article
      className={`home-platform-row${reversed ? " home-platform-row-reversed" : ""}`}
    >
      <MediaPlaceholder
        label={`${title} product view pending`}
        detail="Authentic product imagery has not been supplied."
        ratio="landscape"
      />
      <div className="home-feature-copy">
        <p className="eyebrow">{title}</p>
        <h3 className="text-section">{heading}</h3>
        <p className="text-lead measure">{body}</p>
        <ServiceStatus service={service} />
        <ActionLink href="/platform" variant="text">
          Explore {title} <span aria-hidden="true">↗</span>
        </ActionLink>
      </div>
    </article>
  );
}

function PlatformFeatures({ services }: { services: Service[] }) {
  const marketplace = services.find(
    (service) => service.slug === "marketplace",
  );
  const drip = services.find((service) => service.slug === "drip");
  return (
    <Section aria-labelledby="platform-heading">
      <Container>
        <div className="home-platform-heading">
          <p className="eyebrow">The Offmark platform</p>
          <h2 id="platform-heading" className="text-section">
            More ways to participate in fashion.
          </h2>
        </div>
        <div className="home-platform-list">
          <PlatformRow
            service={marketplace}
            title="Marketplace"
            heading="Discover and support fashion commerce."
            body="Marketplace is Offmark's broader commerce service, separate from the small collection store on this website."
          />
          <PlatformRow
            service={drip}
            title="Drip"
            heading="A social space shaped around fashion."
            body="Drip is Offmark's fashion community service. Its final relationship with Marketplace remains unconfirmed."
            reversed
          />
        </div>
      </Container>
    </Section>
  );
}

function BuildingSection({ updates }: { updates: BuildUpdate[] }) {
  return (
    <Section
      aria-labelledby="building-heading"
      className="home-building-section"
    >
      <Container>
        <div className="home-section-intro">
          <div>
            <p className="eyebrow">Building Offmark</p>
            <h2 id="building-heading" className="text-section">
              Follow the work.
            </h2>
          </div>
          <div>
            <p className="text-lead">
              Dated product progress, demonstrations and releases.
            </p>
            <ActionLink href="/building" variant="text">
              View all updates <span aria-hidden="true">↗</span>
            </ActionLink>
          </div>
        </div>
        {updates.length > 0 ? (
          <div className="home-update-grid">
            {updates.slice(0, 3).map((update) => (
              <article key={update.id} className="home-update-card">
                <div className="home-card-meta">
                  <span className="text-metadata">
                    {formatPublishedDate(update.publishedAt)}
                  </span>
                  {update.provenance.kind === "demo" && (
                    <span className="demo-label">Fictional preview</span>
                  )}
                </div>
                <p className="eyebrow">{update.product}</p>
                <h3 className="heading-card">{update.title}</h3>
                <p>{update.summary}</p>
                {update.evidenceUrl ? (
                  <a href={update.evidenceUrl} className="text-link">
                    View evidence <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <span className="text-metadata">
                    Evidence link not supplied
                  </span>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="The work log is being prepared."
            action={<ActionLink href="/building">Visit Building</ActionLink>}
          >
            <p>No evidence-backed updates have been published yet.</p>
          </EmptyState>
        )}
      </Container>
    </Section>
  );
}

function CompanyStory() {
  return (
    <Section
      theme="dark"
      aria-labelledby="company-heading"
      className="home-company-section"
    >
      <Container className="home-company-layout">
        <div>
          <p className="eyebrow">Offmark · Nigeria</p>
          <h2 id="company-heading" className="text-section">
            Clothing, creativity and community.
          </h2>
        </div>
        <div>
          <p className="text-lead measure">
            Offmark is a Nigerian fashion and technology company connecting
            original clothing, creative tools, commerce and community.
          </p>
          <div className="home-actions">
            <ActionLink href="/about">About Offmark</ActionLink>
            <ActionLink href="/contact" variant="secondary">
              Contact us
            </ActionLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function Homepage({
  services,
  currentDrop,
  featuredDesigns,
  updates,
}: HomepageProps) {
  const seam = services.find((service) => service.slug === "seam");
  const hasDemoContent =
    services.some((service) => service.provenance.kind === "demo") ||
    currentDrop?.provenance.kind === "demo" ||
    updates.some((update) => update.provenance.kind === "demo");

  return (
    <>
      {hasDemoContent && (
        <div className="demo-banner">
          <Container>
            Development preview: collection, status and update content is
            fictional.
          </Container>
        </div>
      )}
      <Section aria-labelledby="hero-heading" className="home-hero-section">
        <Container className="home-hero">
          <div className="home-hero-copy">
            <p className="eyebrow">Offmark · Nigeria</p>
            <h1 id="hero-heading" className="text-hero">
              Fashion.
              <br />
              On your terms.
            </h1>
            <p className="text-lead measure">
              Explore original collections, create with Seam, and discover the
              fashion spaces Offmark is building.
            </p>
            <div className="home-actions">
              <ActionLink href="/collections">Explore collections</ActionLink>
              <ActionLink href="/seam" variant="secondary">
                Discover Seam
              </ActionLink>
            </div>
          </div>
          <MediaPlaceholder
            label="Campaign photograph pending"
            detail="Authentic Offmark campaign imagery is required before launch."
          />
        </Container>
      </Section>
      <CurrentDrop drop={currentDrop} designs={featuredDesigns} />
      <SeamFeature service={seam} />
      <PlatformFeatures services={services} />
      <BuildingSection updates={updates} />
      <CompanyStory />
    </>
  );
}
