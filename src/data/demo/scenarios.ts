export const demoScenarioNames = [
  "success",
  "loading",
  "empty",
  "unavailable",
  "price_changed",
  "expired_quote",
  "payment_pending",
  "payment_failed",
  "payment_confirmed",
  "access_expired",
  "temporary_failure",
] as const;

export type DemoScenario = (typeof demoScenarioNames)[number];

export function isDemoScenario(value: string): value is DemoScenario {
  return demoScenarioNames.includes(value as DemoScenario);
}
