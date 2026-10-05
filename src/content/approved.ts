import type {
  BuildUpdate,
  Design,
  Drop,
  Policy,
  Service,
} from "@/domain/catalog";

const approved = { kind: "approved", publishable: true } as const;

export const approvedServices = [
  {
    id: "service-seam",
    slug: "seam",
    name: "Seam",
    summary: "A standalone fashion design platform from Offmark.",
    availability: "unconfirmed",
    provenance: approved,
  },
  {
    id: "service-marketplace",
    slug: "marketplace",
    name: "Marketplace",
    summary: "Offmark's broader fashion commerce service.",
    availability: "unconfirmed",
    provenance: approved,
  },
  {
    id: "service-drip",
    slug: "drip",
    name: "Drip",
    summary: "Offmark's fashion social and community service.",
    availability: "unconfirmed",
    provenance: approved,
  },
] satisfies Service[];

// No real collection, published update or policy has been supplied yet.
// Public readers intentionally return empty states rather than demo records.
export const approvedDrops: Drop[] = [];
export const approvedDesigns: Design[] = [];
export const approvedBuildUpdates: BuildUpdate[] = [];
export const approvedPolicies: Policy[] = [];
