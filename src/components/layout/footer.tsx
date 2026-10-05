import Link from "next/link";
import { navigation } from "@/config/navigation";
import { Brand } from "./brand";
import { Container } from "./primitives";

// Supplied artwork is orange on pale JPEG. Keep the footer light until a
// genuine white variant is supplied; never manufacture one with CSS filters.
export function Footer() {
  return (
    <footer className="site-footer" data-theme="light">
      <Container>
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="measure">Clothing, creativity and community.</p>
            <p className="muted-copy">
              A fashion and technology company rooted in Nigeria.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
        <p className="text-metadata footer-note">Offmark</p>
      </Container>
    </footer>
  );
}
