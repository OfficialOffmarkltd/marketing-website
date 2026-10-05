export type RecordProvenance = {
  kind: "approved" | "demo";
  label?: string;
  publishable: boolean;
};

export type Asset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  provenance: RecordProvenance;
};

export type Money = {
  amountMinor: number;
  currency: "NGN";
};

export type ServiceAvailability =
  | "live"
  | "beta"
  | "in_development"
  | "unconfirmed";

export type Service = {
  id: string;
  slug: "seam" | "marketplace" | "drip";
  name: string;
  summary: string;
  availability: ServiceAvailability;
  destination?: string;
  screenshot?: Asset;
  provenance: RecordProvenance;
};

export type DropStatus = "draft" | "open" | "closing" | "retired";

export type Drop = {
  id: string;
  slug: string;
  name: string;
  story: string;
  status: DropStatus;
  designIds: string[];
  closesAt?: string;
  campaignImage?: Asset;
  provenance: RecordProvenance;
};

export type Variant = {
  id: string;
  size: string;
  colour: string;
  available: boolean;
  unavailableReason?: string;
};

export type SizeGuide = {
  unit: "cm" | "in";
  rows: {
    size: string;
    measurements: Record<string, number>;
  }[];
};

export type Design = {
  id: string;
  dropId: string;
  slug: string;
  name: string;
  description: string;
  price?: Money;
  images: Asset[];
  materials: string;
  fit: string;
  care: string;
  variants: Variant[];
  sizeGuide?: SizeGuide;
  estimatedDispatchText: string;
  provenance: RecordProvenance;
};

export type BuildUpdateKind = "released" | "demo" | "work_in_progress";

export type BuildUpdate = {
  id: string;
  slug: string;
  publishedAt: string;
  product: string;
  title: string;
  summary: string;
  body: string;
  kind: BuildUpdateKind;
  evidenceUrl?: string;
  publicationStatus: "draft" | "published";
  provenance: RecordProvenance;
};

export type Policy = {
  id: string;
  slug: string;
  title: string;
  version: string;
  effectiveAt: string;
  body: string;
  publicationStatus: "draft" | "published";
  provenance: RecordProvenance;
};
