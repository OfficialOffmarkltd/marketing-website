import {
  approvedBuildUpdates,
  approvedDesigns,
  approvedDrops,
  approvedPolicies,
  approvedServices,
} from "@/content/approved";
import { MemoryDataSource } from "./memory-source";

export class PublicDataSource extends MemoryDataSource {
  constructor() {
    super({
      services: approvedServices,
      drops: approvedDrops,
      designs: approvedDesigns,
      buildUpdates: approvedBuildUpdates,
      policies: approvedPolicies,
    });
  }
}
