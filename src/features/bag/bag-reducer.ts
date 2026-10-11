import type { StoredBagLine } from "@/domain/commerce";

export type BagState = {
  lines: StoredBagLine[];
  hydrated: boolean;
  persistenceAvailable: boolean;
  issue?: string;
};

export type BagAction =
  | { type: "hydrate"; lines: StoredBagLine[]; issue?: string }
  | { type: "storage-unavailable"; issue: string }
  | { type: "external-update"; lines: StoredBagLine[]; issue?: string }
  | { type: "add"; line: StoredBagLine }
  | {
      type: "set-quantity";
      designId: string;
      variantId: string;
      quantity: number;
    }
  | {
      type: "accept-price";
      designId: string;
      variantId: string;
      unitAmountMinor: number;
    }
  | { type: "remove"; designId: string; variantId: string }
  | { type: "clear" };

export const initialBagState: BagState = {
  lines: [],
  hydrated: false,
  persistenceAvailable: true,
};

function matches(line: StoredBagLine, designId: string, variantId: string) {
  return line.designId === designId && line.variantId === variantId;
}

export function bagReducer(state: BagState, action: BagAction): BagState {
  switch (action.type) {
    case "hydrate":
      return {
        ...state,
        hydrated: true,
        lines: action.lines,
        issue: action.issue,
      };
    case "storage-unavailable":
      return {
        ...state,
        hydrated: true,
        persistenceAvailable: false,
        issue: action.issue,
      };
    case "external-update":
      return { ...state, lines: action.lines, issue: action.issue };
    case "add": {
      const existing = state.lines.find((line) =>
        matches(line, action.line.designId, action.line.variantId),
      );
      if (!existing) {
        return {
          ...state,
          lines: [
            ...state.lines,
            { ...action.line, quantity: Math.min(50, action.line.quantity) },
          ],
        };
      }
      return {
        ...state,
        lines: state.lines.map((line) =>
          matches(line, action.line.designId, action.line.variantId)
            ? {
                ...line,
                quantity: Math.min(50, line.quantity + action.line.quantity),
                unitAmountMinor:
                  action.line.unitAmountMinor ?? line.unitAmountMinor,
              }
            : line,
        ),
      };
    }
    case "set-quantity":
      return action.quantity <= 0
        ? {
            ...state,
            lines: state.lines.filter(
              (line) => !matches(line, action.designId, action.variantId),
            ),
          }
        : {
            ...state,
            lines: state.lines.map((line) =>
              matches(line, action.designId, action.variantId)
                ? { ...line, quantity: Math.min(50, action.quantity) }
                : line,
            ),
          };
    case "accept-price":
      return {
        ...state,
        lines: state.lines.map((line) =>
          matches(line, action.designId, action.variantId)
            ? { ...line, unitAmountMinor: action.unitAmountMinor }
            : line,
        ),
      };
    case "remove":
      return {
        ...state,
        lines: state.lines.filter(
          (line) => !matches(line, action.designId, action.variantId),
        ),
      };
    case "clear":
      return { ...state, lines: [] };
  }
}
