"use client";

import { useState } from "react";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";

export function ErrorPreview() {
  const [failed, setFailed] = useState(false);
  if (failed) throw new Error("Intentional local error-boundary preview");
  return (
    <Section>
      <Container>
        <PageHeading>Recovery preview</PageHeading>
        <Button onClick={() => setFailed(true)}>Simulate page failure</Button>
      </Container>
    </Section>
  );
}
