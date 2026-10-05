import { Container, Section } from "@/components/layout/primitives";
import { LoadingState } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <Section>
      <Container>
        <LoadingState />
      </Container>
    </Section>
  );
}
