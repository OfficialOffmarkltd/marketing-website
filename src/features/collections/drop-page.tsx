import { Container, Section } from "@/components/layout/primitives";
import { Badge, EmptyState } from "@/components/ui/feedback";
import type { Design, Drop } from "@/domain/catalog";
import { DesignCard } from "./design-card";
import { CollectionMedia } from "./media";
import { dropStatusLabels, preorderExplanation } from "./status";

export function DropPage({
  drop,
  designs,
  basePath = "/collections",
}: {
  drop: Drop;
  designs: Design[];
  basePath?: string;
}) {
  const retired = drop.status === "retired";
  return (
    <>
      {drop.provenance.kind === "demo" && (
        <div className="demo-banner">
          <Container>
            Development preview: this drop and its designs are fictional.
          </Container>
        </div>
      )}
      <Section className="drop-hero-section">
        <Container>
          <div className="drop-title-row">
            <div>
              <p className="eyebrow">
                {retired ? "Collection archive" : "Current collection"}
              </p>
              <h1 className="text-page">{drop.name}</h1>
            </div>
            <Badge>{dropStatusLabels[drop.status]}</Badge>
          </div>
          <p className="text-lead measure">{drop.story}</p>
          <CollectionMedia
            asset={drop.campaignImage}
            label={`${drop.name} campaign`}
            ratio="landscape"
            priority
            className="drop-campaign-media"
          />
          <div className="drop-status-note">
            <p className="text-label">
              {retired ? "Archived collection" : "Made to preorder"}
            </p>
            <p>{preorderExplanation(drop.status)}</p>
          </div>
        </Container>
      </Section>
      <Section
        aria-labelledby="designs-heading"
        className="drop-designs-section"
      >
        <Container>
          <div className="collection-section-heading">
            <p className="eyebrow">The designs</p>
            <h2 id="designs-heading" className="text-section">
              {retired ? "Explore the archive." : "Choose your design."}
            </h2>
          </div>
          {designs.length > 0 ? (
            <div className="collection-design-grid">
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  drop={drop}
                  basePath={basePath}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No designs published.">
              <p>This drop does not contain any public designs.</p>
            </EmptyState>
          )}
        </Container>
      </Section>
      <Section aria-labelledby="drop-faq-heading" className="drop-faq-section">
        <Container className="drop-faq-layout">
          <div>
            <p className="eyebrow">Before you order</p>
            <h2 id="drop-faq-heading" className="text-section">
              Production and delivery.
            </h2>
          </div>
          <div className="drop-faq-list">
            <details>
              <summary>How does preorder production work?</summary>
              <p>
                Orders are produced against confirmed demand. Exact lead times
                must be stated on each design before live purchasing.
              </p>
            </details>
            <details>
              <summary>When will my order be dispatched?</summary>
              <p>
                The design page shows the confirmed estimate when one is
                available. Demo estimates are fictional and cannot be relied on.
              </p>
            </details>
            <details>
              <summary>What does retirement mean?</summary>
              <p>
                Retired drops stop accepting new orders. Existing paid orders
                still require fulfillment or a communicated resolution.
              </p>
            </details>
          </div>
        </Container>
      </Section>
    </>
  );
}
