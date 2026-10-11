import assert from "node:assert/strict";
import { demoDesigns, demoDrops } from "../src/data/demo/fixtures";
import { parseBagStorage } from "../src/data/validation";
import { bagCanCheckout, reconcileBag } from "../src/features/bag/bag-model";
import { bagReducer, initialBagState } from "../src/features/bag/bag-reducer";

const firstLine = {
  designId: "demo-design-one",
  variantId: "demo-variant-one-s",
  quantity: 1,
  unitAmountMinor: 4_850_000,
};

let state = bagReducer(initialBagState, { type: "hydrate", lines: [] });
assert.equal(state.hydrated, true);
state = bagReducer(state, { type: "add", line: firstLine });
state = bagReducer(state, { type: "add", line: { ...firstLine, quantity: 2 } });
assert.equal(state.lines.length, 1);
assert.equal(state.lines[0]?.quantity, 3);
state = bagReducer(state, {
  type: "set-quantity",
  designId: firstLine.designId,
  variantId: firstLine.variantId,
  quantity: 50,
});
state = bagReducer(state, {
  type: "add",
  line: { ...firstLine, quantity: 10 },
});
assert.equal(state.lines[0]?.quantity, 50);
state = bagReducer(state, {
  type: "accept-price",
  designId: firstLine.designId,
  variantId: firstLine.variantId,
  unitAmountMinor: 4_900_000,
});
assert.equal(state.lines[0]?.unitAmountMinor, 4_900_000);
state = bagReducer(state, {
  type: "remove",
  designId: firstLine.designId,
  variantId: firstLine.variantId,
});
assert.equal(state.lines.length, 0);

const catalogue = demoDrops.flatMap((drop) =>
  demoDesigns
    .filter((design) => design.dropId === drop.id)
    .map((design) => ({ drop, design })),
);
const valid = reconcileBag([firstLine], catalogue);
assert.equal(valid[0]?.changes.length, 0);
assert.equal(valid[0]?.lineTotalMinor, 4_850_000);
assert.equal(bagCanCheckout(valid), true);

const changed = reconcileBag(
  [{ ...firstLine, unitAmountMinor: 4_000_000 }],
  catalogue,
);
assert(changed[0]?.changes.includes("price_changed"));
assert.equal(bagCanCheckout(changed), false);

const unavailable = reconcileBag(
  [{ ...firstLine, variantId: "demo-variant-one-m" }],
  catalogue,
);
assert(unavailable[0]?.changes.includes("unavailable"));

const retired = reconcileBag(
  [
    {
      designId: "demo-design-retired",
      variantId: "demo-variant-retired",
      quantity: 1,
      unitAmountMinor: 5_200_000,
    },
  ],
  catalogue,
);
assert(retired[0]?.changes.includes("unavailable"));

const missing = reconcileBag(
  [{ designId: "missing", variantId: "missing", quantity: 1 }],
  catalogue,
);
assert(missing[0]?.changes.includes("removed"));

const mismatched = reconcileBag(
  [
    {
      designId: "demo-design-one",
      variantId: "demo-variant-two-m",
      quantity: 1,
    },
  ],
  catalogue,
);
assert(mismatched[0]?.changes.includes("variant_design_mismatch"));

const stored = parseBagStorage({ version: 1, lines: [firstLine] });
assert.deepEqual(stored.lines[0], firstLine);

state = bagReducer(state, { type: "external-update", lines: [firstLine] });
assert.equal(state.lines.length, 1);
state = bagReducer(state, { type: "clear" });
assert.equal(state.lines.length, 0);

console.log("Phase 6 bag checks passed.");
