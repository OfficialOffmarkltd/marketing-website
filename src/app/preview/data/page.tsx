import { notFound } from "next/navigation";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { readDataConfiguration } from "@/data/mode";
import { getServerDataSource } from "@/data/source.server";

export default async function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  const source = getServerDataSource();
  const [services, drops, updates] = await Promise.all([
    source.listServices(),
    source.listDrops(),
    source.listBuildUpdates(),
  ]);
  const configuration = readDataConfiguration();

  return (
    <Section>
      <Container>
        <PageHeading
          eyebrow="Development only"
          lead="This page inspects the selected data adapter. It is unavailable in production."
        >
          Data boundary
        </PageHeading>
        <dl className="data-summary">
          <div>
            <dt>Mode</dt>
            <dd>{configuration.mode}</dd>
          </div>
          <div>
            <dt>Scenario</dt>
            <dd>
              {configuration.mode === "demo" ? configuration.scenario : "None"}
            </dd>
          </div>
          <div>
            <dt>Services</dt>
            <dd>{services.length}</dd>
          </div>
          <div>
            <dt>Public drops</dt>
            <dd>{drops.length}</dd>
          </div>
          <div>
            <dt>Published updates</dt>
            <dd>{updates.length}</dd>
          </div>
        </dl>
        <p className="alert alert-info">
          Demo records are fictional and create no real order, payment, email or
          subscription.
        </p>
      </Container>
    </Section>
  );
}
