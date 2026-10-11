import type { DemoScenario } from "./scenarios";

export type SubmissionScenario = Extract<
  DemoScenario,
  "success" | "loading" | "temporary_failure" | "rate_limited"
>;

const values = new Set<SubmissionScenario>([
  "success",
  "loading",
  "temporary_failure",
  "rate_limited",
]);

export function submissionScenario(value?: string): SubmissionScenario {
  return value && values.has(value as SubmissionScenario)
    ? (value as SubmissionScenario)
    : "success";
}
