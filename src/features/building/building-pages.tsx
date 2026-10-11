import Link from "next/link";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { EmptyState } from "@/components/ui/feedback";
import type { BuildUpdate } from "@/domain/catalog";
import { formatPublishedDate } from "@/domain/format";

const kindLabels: Record<BuildUpdate["kind"], string> = {
  released: "Released",
  demo: "Demo",
  work_in_progress: "Work in progress",
};

export function BuildingPage({
  updates,
  basePath = "/building",
}: {
  updates: BuildUpdate[];
  basePath?: string;
}) {
  const demo = updates.some((update) => update.provenance.kind === "demo");
  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: every update shown here is fictional.
          </Container>
        </div>
      )}
      <Section>
        <Container>
          <PageHeading
            eyebrow="Building Offmark"
            lead="Dated product progress, demonstrations and releases backed by real evidence when available."
          >
            Follow the work.
          </PageHeading>
          {updates.length > 0 ? (
            <div className="building-list">
              {updates.map((update) => (
                <article key={update.id} className="building-entry">
                  <div className="building-entry-meta">
                    <time dateTime={update.publishedAt}>
                      {formatPublishedDate(update.publishedAt)}
                    </time>
                    <span className="badge">{kindLabels[update.kind]}</span>
                    {update.provenance.kind === "demo" && (
                      <span className="demo-label">Fictional preview</span>
                    )}
                  </div>
                  <p className="eyebrow">{update.product}</p>
                  <h2 className="heading-card">
                    <Link href={`${basePath}/${update.slug}`}>
                      {update.title}
                    </Link>
                  </h2>
                  <p>{update.summary}</p>
                  <Link
                    className="text-link"
                    href={`${basePath}/${update.slug}`}
                  >
                    Read update <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="The work log is being prepared.">
              <p>No evidence-backed updates have been published yet.</p>
            </EmptyState>
          )}
        </Container>
      </Section>
    </>
  );
}

export function BuildingDetailPage({ update }: { update: BuildUpdate }) {
  return (
    <>
      {update.provenance.kind === "demo" && (
        <div className="demo-banner">
          <Container>
            Development preview: this update and milestone are fictional.
          </Container>
        </div>
      )}
      <Section>
        <Container className="building-detail">
          <nav aria-label="Breadcrumb" className="product-breadcrumbs">
            <Link
              href={
                update.provenance.kind === "demo"
                  ? "/preview/building"
                  : "/building"
              }
            >
              Building
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{update.title}</span>
          </nav>
          <div className="building-detail-heading">
            <div>
              <p className="eyebrow">
                {update.product} · {kindLabels[update.kind]}
              </p>
              <h1 className="text-page">{update.title}</h1>
            </div>
            <time dateTime={update.publishedAt}>
              {formatPublishedDate(update.publishedAt)}
            </time>
          </div>
          <p className="text-lead measure">{update.summary}</p>
          <div className="building-detail-body">
            <section aria-labelledby="changed-heading">
              <h2 id="changed-heading" className="heading-card">
                What changed
              </h2>
              <p>{update.body}</p>
            </section>
            <section aria-labelledby="evidence-heading">
              <h2 id="evidence-heading" className="heading-card">
                Evidence
              </h2>
              {update.evidenceUrl ? (
                <a className="text-link" href={update.evidenceUrl}>
                  Open supporting evidence <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p>No supporting evidence link has been supplied.</p>
              )}
            </section>
            <section aria-labelledby="next-work-heading">
              <h2 id="next-work-heading" className="heading-card">
                Next work
              </h2>
              {update.nextWork ? (
                <Link
                  className="text-link"
                  href={
                    update.provenance.kind === "demo"
                      ? `/preview/building/${update.nextWork.slug}`
                      : `/building/${update.nextWork.slug}`
                  }
                >
                  {update.nextWork.title} <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <p>No next-work note has been supplied for this update.</p>
              )}
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
