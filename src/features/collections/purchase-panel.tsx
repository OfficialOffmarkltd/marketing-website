"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionLink } from "@/components/ui/link";
import type { Design, Drop, Variant } from "@/domain/catalog";
import { formatMoney } from "@/domain/format";
import { useBag } from "@/features/bag/bag-context";
import { collectionHref } from "./data";
import { dropStatusLabels, preorderExplanation } from "./status";

function unique(values: string[]) {
  return [...new Set(values)];
}

function VariantRadio({
  name,
  value,
  selected,
  disabled,
  reason,
  onSelect,
}: {
  name: string;
  value: string;
  selected: boolean;
  disabled: boolean;
  reason?: string;
  onSelect: () => void;
}) {
  return (
    <label
      className="variant-option"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
      />
      <span>{value}</span>
      {disabled && (
        <span className="sr-only">
          Unavailable{reason ? `: ${reason}` : ""}
        </span>
      )}
    </label>
  );
}

function SizeGuideDialog({ design }: { design: Design }) {
  return (
    <DialogRoot>
      <DialogTrigger className="product-size-guide-trigger">
        Size guide
      </DialogTrigger>
      <DialogContent
        title={`${design.name} size guide`}
        description="Garment measurements, not body measurements."
      >
        {design.sizeGuide ? (
          <div className="size-guide-content">
            {design.provenance.kind === "demo" && (
              <p className="alert">
                Fictional measurements for interface review only.
              </p>
            )}
            <div className="size-guide-table-wrap">
              <table className="size-guide-table">
                <caption>Measurements in {design.sizeGuide.unit}</caption>
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    {Object.keys(
                      design.sizeGuide.rows[0]?.measurements ?? {},
                    ).map((name) => (
                      <th scope="col" key={name}>
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {design.sizeGuide.rows.map((row) => (
                    <tr key={row.size}>
                      <th scope="row">{row.size}</th>
                      {Object.values(row.measurements).map(
                        (measurement, index) => (
                          <td key={`${row.size}-${index}`}>{measurement}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="alert">
            Garment measurements have not been supplied for this design. Live
            ordering must remain unavailable until the required sizing
            information is confirmed.
          </p>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

export function PurchasePanel({
  drop,
  design,
  basePath,
}: {
  drop: Drop;
  design: Design;
  basePath: string;
}) {
  const { addLine } = useBag();
  const [colour, setColour] = useState<string>();
  const [size, setSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);
  const actionSeenRef = useRef(false);
  const purchasableDrop = drop.status === "open" || drop.status === "closing";
  const colours = unique(design.variants.map((variant) => variant.colour));
  const sizes = unique(design.variants.map((variant) => variant.size));
  const matchingVariant = useMemo(
    () =>
      design.variants.find(
        (variant) => variant.colour === colour && variant.size === size,
      ),
    [colour, design.variants, size],
  );
  const ready = Boolean(
    purchasableDrop &&
      design.price &&
      matchingVariant?.available &&
      colour &&
      size,
  );

  useEffect(() => {
    const element = actionRef.current;
    if (!element || !purchasableDrop || !design.price) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          actionSeenRef.current = true;
          setShowSticky(false);
        } else if (actionSeenRef.current) {
          setShowSticky(true);
        }
      },
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [design.price, purchasableDrop]);

  const variantAvailable = (variant: Variant) =>
    purchasableDrop && variant.available;
  const colourAvailable = (value: string) =>
    design.variants.some(
      (variant) => variant.colour === value && variantAvailable(variant),
    );
  const sizeAvailable = (value: string) =>
    design.variants.some(
      (variant) =>
        variant.size === value &&
        (!colour || variant.colour === colour) &&
        variantAvailable(variant),
    );
  const actionLabel = design.price
    ? "Add preorder to bag"
    : "Price unavailable";
  const bagHref = basePath.startsWith("/preview") ? "/preview/bag" : "/bag";

  const addToBag = () => {
    if (!ready || !matchingVariant || !design.price) return;
    addLine({
      designId: design.id,
      variantId: matchingVariant.id,
      quantity,
      unitAmountMinor: design.price.amountMinor,
    });
    setMessage(
      `${quantity} × ${design.name}, ${colour}, size ${size} added to your bag.`,
    );
  };

  return (
    <aside
      className="purchase-panel"
      aria-label={`${design.name} purchase options`}
    >
      <div className="purchase-status-row">
        <span className="badge">{dropStatusLabels[drop.status]}</span>
        {design.provenance.kind === "demo" && (
          <span className="demo-label">Fictional preview</span>
        )}
      </div>
      <h1 className="text-page">{design.name}</h1>
      <p className="product-price">
        {design.price ? formatMoney(design.price) : "Price unavailable"}
      </p>
      <p>{design.description}</p>
      <div className="purchase-dispatch">
        <span className="text-label">Estimated dispatch</span>
        <p>{design.estimatedDispatchText}</p>
      </div>

      {design.variants.length > 0 && (
        <>
          <fieldset className="variant-fieldset" disabled={!purchasableDrop}>
            <legend className="text-label">Colour</legend>
            <div className="variant-options">
              {colours.map((value) => (
                <VariantRadio
                  key={value}
                  name="colour"
                  value={value}
                  selected={colour === value}
                  disabled={!colourAvailable(value)}
                  onSelect={() => {
                    setColour(value);
                    setSize(undefined);
                    setMessage("");
                  }}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="variant-fieldset" disabled={!purchasableDrop}>
            <legend className="text-label">Size</legend>
            <div className="variant-guide-row">
              <SizeGuideDialog design={design} />
            </div>
            <div className="variant-options">
              {sizes.map((value) => {
                const variants = design.variants.filter(
                  (variant) =>
                    variant.size === value &&
                    (!colour || variant.colour === colour),
                );
                const reason = variants.find(
                  (variant) => variant.unavailableReason,
                )?.unavailableReason;
                return (
                  <VariantRadio
                    key={value}
                    name="size"
                    value={value}
                    selected={size === value}
                    disabled={!sizeAvailable(value)}
                    reason={reason}
                    onSelect={() => {
                      setSize(value);
                      setMessage("");
                    }}
                  />
                );
              })}
            </div>
          </fieldset>
        </>
      )}

      {purchasableDrop && design.price && (
        <div className="quantity-control">
          <span className="text-label">Quantity</span>
          <div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Decrease quantity"
              disabled={quantity === 1}
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <MinusIcon size={18} aria-hidden="true" />
            </Button>
            <output aria-live="polite" aria-label={`Quantity ${quantity}`}>
              {quantity}
            </output>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label="Increase quantity"
              onClick={() => setQuantity((value) => Math.min(10, value + 1))}
            >
              <PlusIcon size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <div ref={actionRef} className="purchase-action-block">
        {drop.status === "retired" ? (
          <ActionLink href={collectionHref(basePath, drop)} variant="secondary">
            View archive
          </ActionLink>
        ) : (
          <Button type="button" disabled={!ready} onClick={addToBag}>
            {actionLabel}
          </Button>
        )}
        {purchasableDrop && design.price && !ready && (
          <p className="text-metadata">
            Select an available colour and size to continue.
          </p>
        )}
      </div>
      <p className="purchase-explanation">{preorderExplanation(drop.status)}</p>
      <p className="purchase-message" aria-live="polite">
        {message}
      </p>
      {message && (
        <ActionLink href={bagHref} variant="text">
          View bag <span aria-hidden="true">↗</span>
        </ActionLink>
      )}

      {showSticky && ready && design.price && (
        <div className="product-sticky-action">
          <div>
            <span className="text-metadata">{design.name}</span>
            <strong>{formatMoney(design.price)}</strong>
          </div>
          <Button type="button" onClick={addToBag}>
            Add preorder to bag
          </Button>
        </div>
      )}
    </aside>
  );
}
