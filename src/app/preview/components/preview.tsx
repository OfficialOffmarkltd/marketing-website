"use client";

import { useState } from "react";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  Badge,
  EmptyState,
  LoadingState,
} from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { ActionLink } from "@/components/ui/link";

export function ComponentPreview() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <>
      <Section>
        <Container>
          <PageHeading lead="Local component review. No submissions leave this page.">
            Component preview
          </PageHeading>
        </Container>
      </Section>
      {(["light", "orange", "dark"] as const).map((theme) => (
        <Section key={theme} theme={theme}>
          <Container>
            <h2 className="text-section">{theme} surface</h2>
            <div className="action-row preview-row">
              <Button>Primary action</Button>
              <Button variant="outline">Secondary action</Button>
              <Button variant="dark">Dark action</Button>
              <Button variant="link">Text action</Button>
              <Button disabled>Unavailable</Button>
              <Button loading>Saving selection</Button>
              <Badge>Preview</Badge>
            </div>
            <div className="preview-fields">
              <Field
                label={`${theme} email`}
                type="email"
                helper="Use a fictional email for this preview."
              />
              <Field label={`${theme} error`} error="Enter a valid value." />
              <Field label={`${theme} disabled`} disabled value="Unavailable" />
            </div>
            <div className="preview-fields">
              <Alert title="Information">Preview only.</Alert>
              <Alert tone="success" title="Saved locally">
                This is a sample confirmation.
              </Alert>
              <Alert tone="error" title="Unable to continue">
                Review the highlighted fields.
              </Alert>
            </div>
            <DialogRoot>
              <DialogTrigger className="button button-secondary">
                Open {theme} dialog
              </DialogTrigger>
              <DialogContent
                title="Example dialog"
                description="A keyboard-accessible dialog for local review."
              >
                <Field label="Example field" />
                <Button className="preview-row">Example action</Button>
              </DialogContent>
            </DialogRoot>
          </Container>
        </Section>
      ))}
      <Section>
        <Container>
          <EmptyState
            title="Nothing here yet"
            action={<ActionLink href="/">Back to home</ActionLink>}
          >
            An empty collection needs a useful explanation.
          </EmptyState>
          <LoadingState />
          <form
            className="preview-fields"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            <Field label="Demo name" required />
            <Button type="submit">Submit locally</Button>
            {submitted && (
              <Alert title="Demo complete">No data was sent.</Alert>
            )}
          </form>
        </Container>
      </Section>
    </>
  );
}
