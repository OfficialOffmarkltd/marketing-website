import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { ActionLink } from "@/components/ui/link";

export default function NotFound() {
  return (
    <Section>
      <Container>
        <PageHeading
          eyebrow="404"
          lead="This address does not lead to an available page."
        >
          Page not found
        </PageHeading>
        <ActionLink href="/">Back to home</ActionLink>
      </Container>
    </Section>
  );
}
