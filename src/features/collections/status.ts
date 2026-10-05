import type { DropStatus } from "@/domain/catalog";

export const dropStatusLabels: Record<DropStatus, string> = {
  draft: "Draft",
  open: "Preorders open",
  closing: "Closing",
  retired: "Retired",
};

export function preorderExplanation(status: DropStatus) {
  if (status === "retired") {
    return "This collection is kept as an editorial archive. It no longer accepts new orders.";
  }
  if (status === "closing") {
    return "Preorders remain open while the confirmed closing window is active.";
  }
  return "This design is made to preorder. Production begins against confirmed demand.";
}
