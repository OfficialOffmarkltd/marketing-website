import Link from "next/link";
import { Container, Section } from "@/components/layout/primitives";
import type { Design, Drop } from "@/domain/catalog";
import { collectionHref } from "./data";
import { ProductGallery } from "./product-gallery";
import { PurchasePanel } from "./purchase-panel";

export function ProductPage({
  drop,
  design,
  basePath = "/collections",
}: {
  drop: Drop;
  design: Design;
  basePath?: string;
}) {
  return (
    <>
      {design.provenance.kind === "demo" && (
        <div className="demo-banner">
          <Container>
            Development preview: this garment, price, sizing and dispatch
            estimate are fictional.
          </Container>
        </div>
      )}
      <Section className="product-section">
        <Container>
          <nav aria-label="Breadcrumb" className="product-breadcrumbs">
            <Link href={basePath}>Collections</Link>
            <span aria-hidden="true">/</span>
            <Link href={collectionHref(basePath, drop)}>{drop.name}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{design.name}</span>
          </nav>
          <div className="product-layout">
            <ProductGallery images={design.images} name={design.name} />
            <PurchasePanel drop={drop} design={design} basePath={basePath} />
          </div>
        </Container>
      </Section>
      <Section
        aria-labelledby="product-details-heading"
        className="product-details-section"
      >
        <Container>
          <div className="collection-section-heading">
            <p className="eyebrow">Garment details</p>
            <h2 id="product-details-heading" className="text-section">
              Know what you are ordering.
            </h2>
          </div>
          <div className="product-detail-grid">
            <article>
              <h3 className="heading-card">Fabric</h3>
              <p>{design.materials}</p>
            </article>
            <article>
              <h3 className="heading-card">Fit</h3>
              <p>{design.fit}</p>
            </article>
            <article>
              <h3 className="heading-card">Care</h3>
              <p>{design.care}</p>
            </article>
          </div>
          <div className="product-terms-note">
            <p className="text-label">Preorder terms</p>
            <p>
              Final payment timing, shipping, cancellation and return terms have
              not been supplied. Live purchasing must remain unavailable until
              those terms are approved and shown here.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
