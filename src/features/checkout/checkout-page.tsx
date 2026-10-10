"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState, LoadingState } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { ActionLink } from "@/components/ui/link";
import type { DemoScenario } from "@/data/demo/scenarios";
import { DemoDataSource } from "@/data/demo/source";
import type { CheckoutQuote, CheckoutResult } from "@/domain/commerce";
import { DataSourceError } from "@/domain/errors";
import { formatMoney } from "@/domain/format";
import { useBag } from "@/features/bag/bag-context";
import { bagCanCheckout, reconcileBag } from "@/features/bag/bag-model";
import type { BagCatalogueItem } from "@/features/bag/data";

type CheckoutValues = {
  email: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
};

const initialValues: CheckoutValues = {
  email: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
};

export function CheckoutPage({
  catalogue,
  demo = false,
  scenario = "success",
}: {
  catalogue: BagCatalogueItem[];
  demo?: boolean;
  scenario?: DemoScenario;
}) {
  const { lines, hydrated } = useBag();
  const [values, setValues] = useState(initialValues);
  const [quote, setQuote] = useState<CheckoutQuote>();
  const [quoteState, setQuoteState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResult>();
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const reconciled = useMemo(
    () => reconcileBag(lines, catalogue),
    [catalogue, lines],
  );
  const validBag = bagCanCheckout(reconciled);

  useEffect(() => setIdempotencyKey(crypto.randomUUID()), []);
  useEffect(() => {
    if (!hydrated || !validBag || !demo) return;
    let cancelled = false;
    setQuoteState("loading");
    setMessage("");
    new DemoDataSource(scenario)
      .createQuote(
        lines.map(({ designId, variantId, quantity }) => ({
          designId,
          variantId,
          quantity,
        })),
      )
      .then((nextQuote) => {
        if (cancelled) return;
        setQuote(nextQuote);
        setQuoteState("ready");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setQuoteState("error");
        setMessage(
          error instanceof DataSourceError
            ? error.message
            : "The simulated quote could not be created.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [demo, hydrated, lines, scenario, validBag]);

  const update = (field: keyof CheckoutValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!demo || !quote || !validBag || !idempotencyKey) return;
    if (new Date(quote.expiresAt).getTime() <= Date.now()) {
      setMessage(
        "The simulated quote expired. Return to the bag and try again.",
      );
      setQuoteState("error");
      return;
    }
    if (quote.requiresAcknowledgement && !accepted) return;
    setSubmitting(true);
    setMessage("");
    try {
      const checkoutResult = await new DemoDataSource(scenario).beginCheckout({
        quoteId: quote.id,
        contact: {
          email: values.email,
          deliveryAddress: {
            recipientName: values.recipientName,
            line1: values.line1,
            line2: values.line2 || undefined,
            city: values.city,
            state: values.state,
            countryCode: "NG",
            phone: values.phone,
          },
        },
        acceptedPolicyVersions: accepted ? quote.acceptedPolicyVersions : {},
        idempotencyKey,
      });
      setResult(checkoutResult);
      setMessage(
        checkoutResult.paymentState === "failed"
          ? "Simulated payment failed. Your entered details were kept for retry."
          : checkoutResult.paymentState === "pending"
            ? "Simulated payment is pending verification. No order or payment was created."
            : "Simulated payment confirmed. No order or payment was created.",
      );
    } catch (error) {
      setMessage(
        error instanceof DataSourceError
          ? error.message
          : "The simulated checkout could not continue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!hydrated) {
    return (
      <Section>
        <Container>
          <LoadingState label="Loading checkout…" />
        </Container>
      </Section>
    );
  }
  if (lines.length === 0) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Your bag is empty."
            action={
              <ActionLink href="/collections">Explore collections</ActionLink>
            }
          >
            <p>Add a design before beginning checkout.</p>
          </EmptyState>
        </Container>
      </Section>
    );
  }

  return (
    <>
      {demo && (
        <div className="demo-banner">
          <Container>
            Development preview: no order, payment or email will be created.
          </Container>
        </div>
      )}
      <Section>
        <Container>
          <PageHeading
            eyebrow="Guest checkout"
            lead="Confirm contact, delivery, terms and the full stated total before payment."
          >
            Complete your preorder.
          </PageHeading>
          {!demo && (
            <Alert title="Checkout unavailable">
              The live checkout service has not been connected.
            </Alert>
          )}
          {!validBag && (
            <Alert title="Review your bag" tone="error">
              Resolve changed or unavailable items before checkout.{" "}
              <ActionLink href="/bag" variant="text">
                Return to bag
              </ActionLink>
            </Alert>
          )}
          {quoteState === "error" && (
            <Alert title="Unable to quote" tone="error">
              {message}
            </Alert>
          )}
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={submit}>
              <section aria-labelledby="checkout-contact-heading">
                <h2 id="checkout-contact-heading" className="heading-card">
                  Contact
                </h2>
                <Field
                  label="Email address"
                  type="email"
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                  required
                  disabled={!demo || submitting}
                />
              </section>
              <section aria-labelledby="checkout-delivery-heading">
                <h2 id="checkout-delivery-heading" className="heading-card">
                  Delivery
                </h2>
                <div className="checkout-field-grid">
                  <Field
                    label="Recipient name"
                    value={values.recipientName}
                    onChange={(event) =>
                      update("recipientName", event.target.value)
                    }
                    autoComplete="name"
                    required
                    disabled={!demo || submitting}
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    value={values.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    autoComplete="tel"
                    required
                    disabled={!demo || submitting}
                  />
                </div>
                <Field
                  label="Address line 1"
                  value={values.line1}
                  onChange={(event) => update("line1", event.target.value)}
                  autoComplete="address-line1"
                  required
                  disabled={!demo || submitting}
                />
                <Field
                  label="Address line 2"
                  value={values.line2}
                  onChange={(event) => update("line2", event.target.value)}
                  autoComplete="address-line2"
                  disabled={!demo || submitting}
                />
                <div className="checkout-field-grid">
                  <Field
                    label="City"
                    value={values.city}
                    onChange={(event) => update("city", event.target.value)}
                    autoComplete="address-level2"
                    required
                    disabled={!demo || submitting}
                  />
                  <Field
                    label="State"
                    value={values.state}
                    onChange={(event) => update("state", event.target.value)}
                    autoComplete="address-level1"
                    required
                    disabled={!demo || submitting}
                  />
                </div>
              </section>
              {quote?.requiresAcknowledgement && (
                <label className="submission-consent">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    disabled={submitting}
                  />
                  <span>
                    I accept the displayed fictional preorder policy version.
                  </span>
                </label>
              )}
              <Button
                type="submit"
                loading={submitting}
                disabled={
                  !demo ||
                  !validBag ||
                  !quote ||
                  (quote.requiresAcknowledgement && !accepted)
                }
              >
                Pay stated total
              </Button>
              {message && (
                <Alert
                  title={
                    result?.paymentState === "failed"
                      ? "Payment failed"
                      : "Checkout preview"
                  }
                  tone={result?.paymentState === "failed" ? "error" : "success"}
                >
                  {message}
                </Alert>
              )}
            </form>
            <aside
              className="checkout-summary"
              aria-labelledby="checkout-summary-heading"
            >
              <h2 id="checkout-summary-heading" className="heading-card">
                Order summary
              </h2>
              <ul>
                {reconciled.map((line) => (
                  <li key={`${line.stored.designId}:${line.stored.variantId}`}>
                    <span>
                      {line.item?.design.name ?? "Unavailable item"} ×{" "}
                      {line.stored.quantity}
                    </span>
                    <strong>
                      {formatMoney({
                        amountMinor: line.lineTotalMinor,
                        currency: "NGN",
                      })}
                    </strong>
                  </li>
                ))}
              </ul>
              {quoteState === "loading" ? (
                <LoadingState label="Calculating delivery and total…" />
              ) : quote ? (
                <dl>
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatMoney(quote.subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Delivery</dt>
                    <dd>{formatMoney(quote.delivery)}</dd>
                  </div>
                  <div className="checkout-total">
                    <dt>Total</dt>
                    <dd>{formatMoney(quote.total)}</dd>
                  </div>
                </dl>
              ) : (
                <p>Delivery and total are unavailable.</p>
              )}
              <p className="text-metadata">
                Payment is requested only after the authoritative total and
                terms are shown.
              </p>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
