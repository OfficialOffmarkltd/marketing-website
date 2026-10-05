import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { EmptyState } from "@/components/ui/feedback";
import { ActionLink } from "@/components/ui/link";
import type { DropWithDesigns } from "./data";
import { collectionHref } from "./data";
import { CollectionMedia } from "./media";
import { dropStatusLabels } from "./status";

function DropCard({
  item,
  basePath,
}: {
  item: DropWithDesigns;
  basePath: string;
}) {
  const { drop, designs } = item;
  return (
    <article className="collection-drop-card">
      <CollectionMedia
        asset={drop.campaignImage}
        label={`${drop.name} campaign`}
        ratio="landscape"
      />
      <div className="collection-drop-copy">
        <div className="collection-card-meta">
          <span className="badge">{dropStatusLabels[drop.status]}</span>
          {drop.provenance.kind === "demo" && (
            <span className="demo-label">Fictional preview</span>
          )}
        </div>
        <h2 className="text-section">{drop.name}</h2>
        <p className="measure">{drop.story}</p>
        <p className="text-metadata">
          {designs.length} {designs.length === 1 ? "design" : "designs"}
        </p>
        <ActionLink href={collectionHref(basePath, drop)} variant="secondary">
          {drop.status === "retired" ? "View archive" : "Explore drop"}
        </ActionLink>
      </div>
    </article>
  );
}

export function CollectionsPage({
  items,
  basePath = "/collections",
}: {
  items: DropWithDesigns[];
  basePath?: string;
}) {
  const active = items.filter(
    ({ drop }) => drop.status === "open" || drop.status === "closing",
  );
  const retired = items.filter(({ drop }) => drop.status === "retired");
  const demo = items.some(({ drop }) => drop.provenance.kind === "demo");

  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: all collection records are fictional.
          </Container>
        </div>
      )}
      <Section>
        <Container>
          <PageHeading
            eyebrow="Offmark collections"
            lead="Original designs released through demand-led preorders, followed by an editorial archive."
          >
            Designed first. Made for you.
          </PageHeading>
          {active.length > 0 ? (
            <div className="collection-drop-list">
              {active.map((item) => (
                <DropCard key={item.drop.id} item={item} basePath={basePath} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active drops."
              action={<ActionLink href="/building">Follow the work</ActionLink>}
            >
              <p>
                No collection is accepting preorders. Confirmed releases will
                appear here.
              </p>
            </EmptyState>
          )}
        </Container>
      </Section>
      <Section
        aria-labelledby="archive-heading"
        className="collection-archive-section"
      >
        <Container>
          <div className="collection-section-heading">
            <p className="eyebrow">Collection archive</p>
            <h2 id="archive-heading" className="text-section">
              Past drops remain part of the story.
            </h2>
          </div>
          {retired.length > 0 ? (
            <div className="collection-drop-list collection-drop-list-archive">
              {retired.map((item) => (
                <DropCard key={item.drop.id} item={item} basePath={basePath} />
              ))}
            </div>
          ) : (
            <p className="muted-copy">
              No retired collections have been published.
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
