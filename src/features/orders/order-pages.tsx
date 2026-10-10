"use client";

import { type FormEvent, useEffect, useState } from "react";
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
import type { OrderView } from "@/domain/commerce";
import { DataSourceError } from "@/domain/errors";
import { formatMoney, formatPublishedDate } from "@/domain/format";

export function OrderAccessPage({
  demo = false,
  scenario = "success",
}: {
  demo?: boolean;
  scenario?: DemoScenario;
}) {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!demo) return;
    setSubmitting(true);
    setMessage("");
    try {
      await new DemoDataSource(scenario).requestOrderAccess({
        email,
        reference,
      });
      setMessage(
        "If the fictional order and email matched, an access link would be sent. No email was created.",
      );
    } catch (error) {
      setMessage(
        error instanceof DataSourceError
          ? error.message
          : "The simulated access request failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section>
      <Container className="order-access-layout">
        <div>
          <PageHeading
            eyebrow="Order access"
            lead="Request a secure email link to view fulfillment status. An order reference alone never grants access."
          >
            Track your order.
          </PageHeading>
          {!demo && (
            <Alert title="Order access unavailable">
              The live order service has not been connected.
            </Alert>
          )}
        </div>
        <form className="submission-form" onSubmit={submit}>
          <Field
            label="Order reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            autoComplete="off"
            required
            disabled={!demo || submitting}
          />
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={!demo || submitting}
            helper={
              demo
                ? "Use fictional details in this development preview."
                : undefined
            }
          />
          <Button type="submit" loading={submitting} disabled={!demo}>
            Email access link
          </Button>
          {message && <Alert title="Request received">{message}</Alert>}
        </form>
      </Container>
    </Section>
  );
}

export function OrderAccessVerifyPage({
  token,
  demo = false,
  scenario = "success",
}: {
  token?: string;
  demo?: boolean;
  scenario?: DemoScenario;
}) {
  const [state, setState] = useState<"verifying" | "authorized" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("Verifying secure access…");

  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      demo ? "/preview/orders/access/verify" : "/orders/access/verify",
    );
    if (!demo || !token) {
      setState("error");
      setMessage("This access link is missing, invalid or expired.");
      return;
    }
    new DemoDataSource(scenario)
      .redeemOrderAccess(token)
      .then(() => {
        setState("authorized");
        setMessage(
          "Simulated access established. No real session was created.",
        );
      })
      .catch((error: unknown) => {
        setState("error");
        setMessage(
          error instanceof DataSourceError
            ? error.message
            : "This access link could not be verified.",
        );
      });
  }, [demo, scenario, token]);

  return (
    <Section>
      <Container>
        <PageHeading eyebrow="Order access">
          {state === "authorized" ? "Access confirmed." : "Verify access."}
        </PageHeading>
        {state === "verifying" ? (
          <LoadingState label={message} />
        ) : (
          <Alert
            title={
              state === "authorized"
                ? "Preview authorized"
                : "Access unavailable"
            }
            tone={state === "error" ? "error" : "success"}
          >
            {message}
          </Alert>
        )}
        <ActionLink href="/orders/access" variant="text">
          Request another link
        </ActionLink>
      </Container>
    </Section>
  );
}

const paymentLabels: Record<OrderView["paymentState"], string> = {
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};
const fulfillmentLabels: Record<OrderView["fulfillmentState"], string> = {
  awaiting_production: "Awaiting production",
  in_production: "In production",
  quality_check: "Quality check",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderPage({
  reference,
  demo = false,
  scenario = "success",
}: {
  reference: string;
  demo?: boolean;
  scenario?: DemoScenario;
}) {
  const [order, setOrder] = useState<OrderView>();
  const [error, setError] = useState("");
  const [pollingComplete, setPollingComplete] = useState(false);

  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    const load = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const next = await new DemoDataSource(scenario).getOrder(reference);
        if (cancelled) return;
        setOrder(next);
        if (next.paymentState === "pending" && attempt < 3) {
          const delays = [500, 1000, 2000];
          timeout = setTimeout(load, delays[attempt]);
          attempt += 1;
        } else if (next.paymentState === "pending") {
          setPollingComplete(true);
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof DataSourceError
              ? reason.message
              : "The simulated order could not be loaded.",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [demo, reference, scenario]);

  if (!demo) {
    return (
      <Section>
        <Container>
          <EmptyState
            title="Secure access required."
            action={
              <ActionLink href="/orders/access">
                Request order access
              </ActionLink>
            }
          >
            <p>
              Use the email access flow before viewing customer order
              information.
            </p>
          </EmptyState>
        </Container>
      </Section>
    );
  }
  if (error)
    return (
      <Section>
        <Container>
          <Alert title="Unable to load order" tone="error">
            {error}
          </Alert>
        </Container>
      </Section>
    );
  if (!order)
    return (
      <Section>
        <Container>
          <LoadingState label="Loading order status…" />
        </Container>
      </Section>
    );

  return (
    <>
      <div className="demo-banner">
        <Container>
          Development preview: this order, payment and fulfillment history are
          fictional.
        </Container>
      </div>
      <Section>
        <Container>
          <PageHeading
            eyebrow="Order status"
            lead={`Placed ${formatPublishedDate(order.placedAt)}`}
          >
            {order.reference}
          </PageHeading>
          <div className="order-status-grid">
            <article>
              <p className="text-metadata">Payment</p>
              <h2 className="heading-card">
                {paymentLabels[order.paymentState]}
              </h2>
            </article>
            <article>
              <p className="text-metadata">Fulfillment</p>
              <h2 className="heading-card">
                {fulfillmentLabels[order.fulfillmentState]}
              </h2>
            </article>
            <article>
              <p className="text-metadata">Dispatch estimate</p>
              <h2 className="heading-card">{order.estimatedDispatchText}</h2>
            </article>
          </div>
          {pollingComplete && (
            <Alert title="Still pending">
              Automatic checks stopped. Refresh later for a verified payment
              result.
            </Alert>
          )}
          <div className="order-layout">
            <section aria-labelledby="order-items-heading">
              <h2 id="order-items-heading" className="text-section">
                Items
              </h2>
              <div className="order-lines">
                {order.lines.map((line, index) => (
                  <article key={`${line.design?.id ?? "missing"}-${index}`}>
                    <span>
                      {line.design?.name ?? "Unavailable item"} ×{" "}
                      {line.quantity}
                    </span>
                    <strong>{formatMoney(line.lineTotal)}</strong>
                  </article>
                ))}
              </div>
            </section>
            <aside className="checkout-summary">
              <h2 className="heading-card">Total</h2>
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatMoney(order.subtotal)}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>{formatMoney(order.delivery)}</dd>
                </div>
                <div className="checkout-total">
                  <dt>Total</dt>
                  <dd>{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </aside>
          </div>
          <section
            className="order-timeline"
            aria-labelledby="order-history-heading"
          >
            <h2 id="order-history-heading" className="text-section">
              Order history
            </h2>
            <ol>
              {order.events.map((event) => (
                <li key={`${event.occurredAt}-${event.label}`}>
                  <time dateTime={event.occurredAt}>
                    {formatPublishedDate(event.occurredAt)}
                  </time>
                  <strong>{event.label}</strong>
                  {event.detail && <p>{event.detail}</p>}
                </li>
              ))}
            </ol>
          </section>
        </Container>
      </Section>
    </>
  );
}
