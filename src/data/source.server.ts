import type { ClientDataConfiguration } from "./client-config";
import type { OffmarkDataSource } from "./contracts";
import { DemoDataSource } from "./demo/source";
import { HttpDataSource } from "./http/source";
import { readDataConfiguration } from "./mode";
import { PublicDataSource } from "./public-source";

// Server Components import this module directly. Client Components receive
// serializable records or use a separately configured browser adapter later.
export function getServerDataSource(): OffmarkDataSource {
  const configuration = readDataConfiguration();
  switch (configuration.mode) {
    case "public":
      return new PublicDataSource();
    case "demo":
      return new DemoDataSource(configuration.scenario);
    case "live":
      return new HttpDataSource(configuration.apiOrigin);
  }
}

export function getClientDataConfiguration(): ClientDataConfiguration {
  const configuration = readDataConfiguration();
  if (configuration.mode !== "live") return configuration;
  return {
    mode: "live",
    apiOrigin:
      process.env.NEXT_PUBLIC_OFFMARK_API_ORIGIN?.trim() ||
      configuration.apiOrigin,
  };
}
