export const demoScenarioNames = [
  "success",
  "loading",
  "empty",
  "delivery_unavailable",
  "unavailable",
  "price_changed",
  "expired_quote",
  "payment_pending",
  "payment_failed",
  "payment_confirmed",
  "order_dispatched",
  "order_refunded",
  "access_expired",
  "rate_limited",
  "temporary_failure",
] as const;

export type DemoScenario = (typeof demoScenarioNames)[number];

export function isDemoScenario(value: string): value is DemoScenario {
  return demoScenarioNames.includes(value as DemoScenario);
}
