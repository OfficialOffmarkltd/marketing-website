"use client";

import type { ClientDataConfiguration } from "./client-config";
import type { OffmarkDataSource } from "./contracts";
import { DemoDataSource } from "./demo/source";
import { HttpDataSource } from "./http/source";
import { PublicDataSource } from "./public-source";

export function createClientDataSource(
  configuration: ClientDataConfiguration,
): OffmarkDataSource {
  switch (configuration.mode) {
    case "demo":
      return new DemoDataSource(configuration.scenario);
    case "live":
      return new HttpDataSource(configuration.apiOrigin);
    case "public":
      return new PublicDataSource();
  }
}
