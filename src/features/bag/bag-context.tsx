"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { parseBagStorage } from "@/data/validation";
import type { StoredBagLine } from "@/domain/commerce";
import { bagReducer, initialBagState } from "./bag-reducer";

export const BAG_STORAGE_KEY = "offmark-bag-v1";

type BagContextValue = {
  lines: StoredBagLine[];
  count: number | null;
  hydrated: boolean;
  persistenceAvailable: boolean;
  issue?: string;
  addLine: (line: StoredBagLine) => void;
  setQuantity: (designId: string, variantId: string, quantity: number) => void;
  acceptPrice: (
    designId: string,
    variantId: string,
    unitAmountMinor: number,
  ) => void;
  removeLine: (designId: string, variantId: string) => void;
  clear: () => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bagReducer, initialBagState);
  const initializedRef = useRef(false);
  const [announcement, setAnnouncement] = useState({ id: 0, message: "" });
  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({ id: current.id + 1, message }));
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    try {
      const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
      if (!raw) {
        dispatch({ type: "hydrate", lines: [] });
        return;
      }
      try {
        const stored = parseBagStorage(JSON.parse(raw));
        dispatch({ type: "hydrate", lines: stored.lines });
      } catch {
        window.localStorage.removeItem(BAG_STORAGE_KEY);
        dispatch({
          type: "hydrate",
          lines: [],
          issue: "The saved bag could not be read and was reset.",
        });
      }
    } catch {
      dispatch({
        type: "storage-unavailable",
        issue:
          "This bag will last only for the current tab because browser storage is unavailable.",
      });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated || !state.persistenceAvailable) return;
    try {
      window.localStorage.setItem(
        BAG_STORAGE_KEY,
        JSON.stringify({ version: 1, lines: state.lines }),
      );
    } catch {
      dispatch({
        type: "storage-unavailable",
        issue:
          "Changes are kept in memory only because the bag could not be saved.",
      });
    }
  }, [state.hydrated, state.lines, state.persistenceAvailable]);

  useEffect(() => {
    const synchronize = (event: StorageEvent) => {
      if (event.key !== BAG_STORAGE_KEY) return;
      if (!event.newValue) {
        dispatch({ type: "external-update", lines: [] });
        announce("Bag cleared in another tab.");
        return;
      }
      try {
        const stored = parseBagStorage(JSON.parse(event.newValue));
        dispatch({ type: "external-update", lines: stored.lines });
        announce("Bag updated in another tab.");
      } catch {
        dispatch({
          type: "external-update",
          lines: [],
          issue: "A bag update from another tab was invalid and was not kept.",
        });
      }
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, [announce]);

  const value = useMemo<BagContextValue>(
    () => ({
      lines: state.lines,
      count: state.hydrated
        ? state.lines.reduce((total, line) => total + line.quantity, 0)
        : null,
      hydrated: state.hydrated,
      persistenceAvailable: state.persistenceAvailable,
      issue: state.issue,
      addLine(line) {
        dispatch({ type: "add", line });
        announce(`${line.quantity} item added to bag.`);
      },
      setQuantity(designId, variantId, quantity) {
        dispatch({ type: "set-quantity", designId, variantId, quantity });
        announce(
          quantity <= 0
            ? "Item removed from bag."
            : `Quantity changed to ${quantity}.`,
        );
      },
      acceptPrice(designId, variantId, unitAmountMinor) {
        dispatch({
          type: "accept-price",
          designId,
          variantId,
          unitAmountMinor,
        });
        announce("Current price accepted.");
      },
      removeLine(designId, variantId) {
        dispatch({ type: "remove", designId, variantId });
        announce("Item removed from bag.");
      },
      clear() {
        dispatch({ type: "clear" });
        announce("Bag cleared.");
      },
    }),
    [announce, state],
  );

  return (
    <BagContext.Provider value={value}>
      {children}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        <span key={announcement.id}>{announcement.message}</span>
      </span>
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) throw new Error("useBag must be used within BagProvider");
  return context;
}
