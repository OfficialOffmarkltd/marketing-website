"use client";

import { MinusIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Container,
  PageHeading,
  Section,
} from "@/components/layout/primitives";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState, LoadingState } from "@/components/ui/feedback";
import { ActionLink } from "@/components/ui/link";
import { formatMoney } from "@/domain/format";
import { collectionHref } from "@/features/collections/data";
import { CollectionMedia } from "@/features/collections/media";
import { useBag } from "./bag-context";
import {
  bagCanCheckout,
  type ReconciledBagLine,
  reconcileBag,
} from "./bag-model";
import type { BagCatalogueItem } from "./data";

const changeMessages = {
  removed: "This item is no longer in the published catalogue.",
  unavailable: "This variant or collection is no longer available.",
  unpriced: "A confirmed price is not available.",
  variant_design_mismatch:
    "This variant does not belong to the selected design.",
  quantity_adjusted: "The available quantity changed.",
  price_changed: "The price changed since this item was added.",
} as const;

function BagLineItem({
  line,
  basePath,
}: {
  line: ReconciledBagLine;
  basePath: string;
}) {
  const { setQuantity, removeLine, acceptPrice } = useBag();
  const { item, variant, stored, changes } = line;
  const design = item?.design;
  const drop = item?.drop;
  const priceChanged = changes.includes("price_changed");

  return (
    <article className="bag-line">
      <div className="bag-line-media">
        <CollectionMedia
          asset={design?.images[0]}
          label={design?.name ?? "Unavailable design"}
        />
      </div>
      <div className="bag-line-copy">
        <div className="bag-line-heading">
          <div>
            <p className="text-metadata">
              {drop?.name ?? "Catalogue item unavailable"}
            </p>
            <h2 className="heading-card">
              {design && drop ? (
                <Link href={collectionHref(basePath, drop, design)}>
                  {design.name}
                </Link>
              ) : (
                "Unavailable design"
              )}
            </h2>
          </div>
          <Button
            type="button"
            variant="link"
            size="compact"
            aria-label={`Remove ${design?.name ?? "unavailable item"}`}
            onClick={() => removeLine(stored.designId, stored.variantId)}
          >
            <TrashIcon size={18} aria-hidden="true" /> Remove
          </Button>
        </div>
        <p>
          {variant
            ? `${variant.colour} · ${variant.size}`
            : "Variant unavailable"}
        </p>
        <p className="text-label">
          {design?.price ? formatMoney(design.price) : "Price unavailable"}
        </p>

        {changes.length > 0 && (
          <div className="bag-line-changes">
            {[...new Set(changes)].map((change) => (
              <p key={change}>{changeMessages[change]}</p>
            ))}
            {priceChanged && design?.price && (
              <Button
                type="button"
                variant="outline"
                size="compact"
                onClick={() =>
                  acceptPrice(
                    stored.designId,
                    stored.variantId,
                    design.price?.amountMinor ?? 0,
                  )
                }
              >
                Accept {formatMoney(design.price)}
              </Button>
            )}
          </div>
        )}

        <div className="bag-line-footer">
          <fieldset className="bag-quantity">
            <legend className="sr-only">
              Quantity for {design?.name ?? "item"}
            </legend>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Decrease quantity"
              disabled={stored.quantity === 1}
              onClick={() =>
                setQuantity(
                  stored.designId,
                  stored.variantId,
                  stored.quantity - 1,
                )
              }
            >
              <MinusIcon size={18} aria-hidden="true" />
            </Button>
            <output
              aria-live="polite"
              aria-label={`Quantity ${stored.quantity}`}
            >
              {stored.quantity}
            </output>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Increase quantity"
              disabled={stored.quantity >= 50}
              onClick={() =>
                setQuantity(
                  stored.designId,
                  stored.variantId,
                  stored.quantity + 1,
                )
              }
            >
              <PlusIcon size={18} aria-hidden="true" />
            </Button>
          </fieldset>
          <strong>
            {design?.price
              ? formatMoney({
                  amountMinor: line.lineTotalMinor,
                  currency: "NGN",
                })
              : "—"}
          </strong>
        </div>
      </div>
    </article>
  );
}

export function BagPage({
  catalogue,
  basePath = "/collections",
}: {
  catalogue: BagCatalogueItem[];
  basePath?: string;
}) {
  const { lines, hydrated, issue, clear } = useBag();
  const reconciled = reconcileBag(lines, catalogue);
  const canCheckout = bagCanCheckout(reconciled);
  const checkoutHref = basePath.startsWith("/preview")
    ? "/preview/checkout"
    : "/checkout";
  const subtotalMinor = reconciled.reduce(
    (total, line) => total + line.lineTotalMinor,
    0,
  );

  if (!hydrated) {
    return (
      <Section>
        <Container>
          <LoadingState label="Loading your bag…" />
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <PageHeading
          eyebrow="Offmark collections"
          lead="Review variants, quantities and the current subtotal before checkout."
        >
          Your bag
        </PageHeading>
        {issue && <Alert title="Bag storage notice">{issue}</Alert>}
        {lines.length === 0 ? (
          <EmptyState
            title="Your bag is empty."
            action={
              <ActionLink href={basePath}>Explore collections</ActionLink>
            }
          >
            <p>Select a design, colour and size to begin a preorder.</p>
          </EmptyState>
        ) : (
          <div className="bag-layout">
            <div className="bag-lines">
              {reconciled.map((line) => (
                <BagLineItem
                  key={`${line.stored.designId}:${line.stored.variantId}`}
                  line={line}
                  basePath={basePath}
                />
              ))}
              <Button type="button" variant="link" onClick={clear}>
                Clear bag
              </Button>
            </div>
            <aside
              className="bag-summary"
              aria-labelledby="bag-summary-heading"
            >
              <h2 id="bag-summary-heading" className="heading-card">
                Order summary
              </h2>
              <dl>
                <div>
                  <dt>Subtotal</dt>
                  <dd>
                    {formatMoney({
                      amountMinor: subtotalMinor,
                      currency: "NGN",
                    })}
                  </dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>
              {!canCheckout && (
                <p className="alert">
                  Resolve changed or unavailable items before continuing.
                </p>
              )}
              {canCheckout ? (
                <ActionLink href={checkoutHref}>
                  Continue to checkout
                </ActionLink>
              ) : (
                <Button disabled>Continue to checkout</Button>
              )}
              <ActionLink href={basePath} variant="text">
                Continue shopping
              </ActionLink>
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
