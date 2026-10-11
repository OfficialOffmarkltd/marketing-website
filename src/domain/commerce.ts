import type { Design, Drop, Money, Variant } from "./catalog";

export type BagLine = {
  designId: string;
  variantId: string;
  quantity: number;
};

export type StoredBagLine = BagLine & {
  /** Price shown when the customer added or last accepted this line. */
  unitAmountMinor?: number;
};

export type BagStorage = {
  version: 1;
  lines: StoredBagLine[];
};

export type BagLineChange =
  | "price_changed"
  | "unpriced"
  | "unavailable"
  | "quantity_adjusted"
  | "removed"
  | "variant_design_mismatch";

export type ValidatedDesignSnapshot = Omit<
  Design,
  "variants" | "provenance" | "images" | "sizeGuide"
>;

export type ValidatedDropSnapshot = Omit<
  Drop,
  "designIds" | "provenance" | "campaignImage"
>;

export type ValidatedBagLine = {
  design: ValidatedDesignSnapshot | null;
  drop: ValidatedDropSnapshot | null;
  variant: Variant | null;
  quantity: number;
  lineTotal: Money;
  changes: BagLineChange[];
};

export type ValidatedBag = {
  lines: ValidatedBagLine[];
  subtotal: Money;
  validForCheckout: boolean;
};

export type DeliveryAddress = {
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  countryCode: "NG";
  phone: string;
};

export type CheckoutQuote = {
  id: string;
  expiresAt: string;
  lines: ValidatedBagLine[];
  subtotal: Money;
  delivery: Money;
  total: Money;
  acceptedPolicyVersions: Record<string, string>;
  requiresAcknowledgement: boolean;
};

export type CheckoutContact = {
  email: string;
  deliveryAddress: DeliveryAddress;
};

export type CheckoutSessionRequest = {
  quoteId: string;
  contact: CheckoutContact;
  acceptedPolicyVersions: Record<string, string>;
  idempotencyKey: string;
};

export type CheckoutResult = {
  orderReference: string;
  paymentState: PaymentState;
  redirectUrl?: string;
  simulated: boolean;
};

export type PaymentState = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentState =
  | "awaiting_production"
  | "in_production"
  | "quality_check"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type OrderEvent = {
  occurredAt: string;
  label: string;
  detail?: string;
};

export type OrderView = {
  reference: string;
  placedAt: string;
  paymentState: PaymentState;
  fulfillmentState: FulfillmentState;
  lines: ValidatedBagLine[];
  subtotal: Money;
  delivery: Money;
  total: Money;
  estimatedDispatchText: string;
  events: OrderEvent[];
  simulated: boolean;
};

export type OrderAccessRequest = { email: string; reference: string };
export type OrderAccessReceipt = { acknowledged: true; simulated: boolean };
export type RedeemOrderAccessResult = { authorized: true; simulated: boolean };

export type WaitlistSubmission = {
  email: string;
  serviceId: string;
  consent: true;
};

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type SubmissionReceipt = { acknowledged: true; simulated: boolean };
