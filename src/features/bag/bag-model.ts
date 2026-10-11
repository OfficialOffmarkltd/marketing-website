import type { Variant } from "@/domain/catalog";
import type { BagLineChange, StoredBagLine } from "@/domain/commerce";
import type { BagCatalogueItem } from "./data";

export type ReconciledBagLine = {
  stored: StoredBagLine;
  item?: BagCatalogueItem;
  variant?: Variant;
  changes: BagLineChange[];
  lineTotalMinor: number;
};

export function reconcileBag(
  lines: StoredBagLine[],
  catalogue: BagCatalogueItem[],
): ReconciledBagLine[] {
  return lines.map((stored) => {
    const item = catalogue.find(({ design }) => design.id === stored.designId);
    const variantOwner = catalogue.find(({ design }) =>
      design.variants.some((candidate) => candidate.id === stored.variantId),
    );
    const variant = item?.design.variants.find(
      (candidate) => candidate.id === stored.variantId,
    );
    const changes: BagLineChange[] = [];

    if (!item) changes.push("removed");
    if (item && item.drop.status !== "open" && item.drop.status !== "closing") {
      changes.push("unavailable");
    }
    if (!variant && !variantOwner) changes.push("removed");
    if (variantOwner && variantOwner.design.id !== stored.designId) {
      changes.push("variant_design_mismatch");
    }
    if (variant && !variant.available) changes.push("unavailable");
    if (item && !item.design.price) changes.push("unpriced");
    if (
      item?.design.price &&
      stored.unitAmountMinor !== undefined &&
      stored.unitAmountMinor !== item.design.price.amountMinor
    ) {
      changes.push("price_changed");
    }

    return {
      stored,
      item,
      variant,
      changes: [...new Set(changes)],
      lineTotalMinor: item?.design.price
        ? item.design.price.amountMinor * stored.quantity
        : 0,
    };
  });
}

export function bagCanCheckout(lines: ReconciledBagLine[]) {
  return lines.length > 0 && lines.every((line) => line.changes.length === 0);
}
