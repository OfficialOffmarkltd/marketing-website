import type { DemoScenario } from "./demo/scenarios";

export type ClientDataConfiguration =
  | { mode: "public" }
  | { mode: "demo"; scenario: DemoScenario }
  | { mode: "live"; apiOrigin: string };
