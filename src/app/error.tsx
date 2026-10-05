"use client";

import { useTransition } from "react";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import { ActionLink } from "@/components/ui/link";

export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Section>
      <Container>
        <PageHeading lead="We could not load this page. Please try again.">
          Something went wrong
        </PageHeading>
        <div className="action-row">
          <Button
            loading={pending}
            onClick={() => startTransition(() => retry())}
          >
            Try again
          </Button>
          <ActionLink href="/" variant="secondary">
            Back to home
          </ActionLink>
        </div>
      </Container>
    </Section>
  );
}
