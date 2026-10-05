import { ActionLink } from "@/components/ui/link";
import { Container, PageHeading, Section } from "./primitives";

export function RoutePlaceholder({
  title,
  lead,
  detail = "This page is being prepared.",
}: {
  title: string;
  lead: string;
  detail?: string;
}) {
  return (
    <Section>
      <Container>
        <PageHeading eyebrow="Website preview" lead={lead}>
          {title}
        </PageHeading>
        <p className="muted-copy">{detail}</p>
        <ActionLink href="/" variant="secondary">
          Back to home
        </ActionLink>
      </Container>
    </Section>
  );
}
