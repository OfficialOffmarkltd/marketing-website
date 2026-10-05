import { DataSourceError } from "@/domain/errors";
import { type DemoScenario, isDemoScenario } from "./demo/scenarios";

export type DataMode = "public" | "demo" | "live";

export type DataConfiguration =
  | { mode: "public" }
  | { mode: "demo"; scenario: DemoScenario }
  | { mode: "live"; apiOrigin: string };

function configurationError(message: string): never {
  throw new DataSourceError({ code: "configuration_error", message });
}

export function readDataConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): DataConfiguration {
  const mode = environment.OFFMARK_DATA_MODE?.trim() || "public";
  if (mode === "public") return { mode };

  if (mode === "demo") {
    if (environment.NODE_ENV !== "development") {
      return configurationError(
        "Demo data mode is available only in development.",
      );
    }
    const scenario = environment.OFFMARK_DEMO_SCENARIO?.trim() || "success";
    if (!isDemoScenario(scenario)) {
      return configurationError(`Unknown demo scenario: ${scenario}.`);
    }
    return { mode, scenario };
  }

  if (mode === "live") {
    const apiOrigin = environment.OFFMARK_API_ORIGIN?.trim();
    if (!apiOrigin) {
      return configurationError("Live data mode requires OFFMARK_API_ORIGIN.");
    }
    try {
      const url = new URL(apiOrigin);
      if (!/^https?:$/.test(url.protocol))
        throw new Error("Unsupported protocol");
      return { mode, apiOrigin: url.origin };
    } catch {
      return configurationError(
        "OFFMARK_API_ORIGIN must be a valid HTTP(S) origin.",
      );
    }
  }

  return configurationError(`Unknown OFFMARK_DATA_MODE: ${mode}.`);
}
