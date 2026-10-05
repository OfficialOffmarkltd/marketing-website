import Image from "next/image";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="foundation-header site-container">
        <a href="/" aria-label="Offmark home" className="brand-home">
          <span className="brand-logo-frame">
            <Image
              src="/logo_w_words.jpg"
              alt=""
              width={8202}
              height={4687}
              sizes="(min-width: 1024px) 289px, 245px"
              className="brand-logo-image"
              unoptimized
              preload
            />
          </span>
        </a>
        <span className="text-metadata">Website preview</span>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="section" aria-labelledby="hero-heading">
          <div className="site-container foundation-hero">
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
          </div>
        </section>
        <section
          id="collections"
          className="section"
          data-theme="orange"
          aria-labelledby="collections-heading"
        >
          <div className="site-container">
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
          </div>
        </section>
      </main>
      <footer className="section" data-theme="dark">
        <div className="site-container">
          <p className="text-card">Clothing, creativity and community.</p>
          <p className="foundation-lead measure">
            A fashion and technology company rooted in Nigeria.
          </p>
          <a className="foundation-link" href="#main">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </footer>
    </>
  );
}
