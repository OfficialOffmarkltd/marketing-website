import { Container, Section } from "@/components/layout/primitives";

export default function Home() {
  return (
    <>
      <Section aria-labelledby="hero-heading">
        <Container className="foundation-hero">
          <div>
            <p className="eyebrow">Offmark · Nigeria</p>
            <h1 id="hero-heading" className="text-hero">
              Fashion.
              <br />
              On your terms.
            </h1>
            <p className="text-lead measure foundation-lead">
              Explore original collections, create with Seam, and discover the
              fashion spaces Offmark is building.
            </p>
            <a className="foundation-link" href="#collections">
              Discover our collections <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="media-placeholder">
            <p className="text-metadata">Campaign photograph pending</p>
          </div>
        </Container>
      </Section>
      <Section
        id="collections"
        theme="orange"
        aria-labelledby="collections-heading"
      >
        <Container>
          <p className="eyebrow">Offmark collections</p>
          <h2 id="collections-heading" className="text-section">
            Designed first.
            <br />
            Made for you.
          </h2>
          <p className="measure foundation-lead">
            Original designs, made to preorder. Collection details are coming
            soon.
          </p>
        </Container>
      </Section>
    </>
  );
}
