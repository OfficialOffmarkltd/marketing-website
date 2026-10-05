import type {
  BuildUpdate,
  Design,
  Drop,
  Policy,
  Service,
} from "@/domain/catalog";
import type {
  BagLine,
  CheckoutQuote,
  CheckoutResult,
  CheckoutSessionRequest,
  ContactSubmission,
  OrderAccessReceipt,
  OrderAccessRequest,
  OrderView,
  RedeemOrderAccessResult,
  SubmissionReceipt,
  ValidatedBag,
  WaitlistSubmission,
} from "@/domain/commerce";

export interface PublicContentReader {
  listServices(): Promise<Service[]>;
  listDrops(): Promise<Drop[]>;
  getDrop(slug: string): Promise<Drop | null>;
  getDesign(id: string): Promise<Design | null>;
  listBuildUpdates(): Promise<BuildUpdate[]>;
  getBuildUpdate(slug: string): Promise<BuildUpdate | null>;
  getPolicy(slug: string): Promise<Policy | null>;
}

export interface CommerceGateway {
  validateBag(lines: BagLine[]): Promise<ValidatedBag>;
  createQuote(lines: BagLine[]): Promise<CheckoutQuote>;
  beginCheckout(request: CheckoutSessionRequest): Promise<CheckoutResult>;
  requestOrderAccess(request: OrderAccessRequest): Promise<OrderAccessReceipt>;
  redeemOrderAccess(token: string): Promise<RedeemOrderAccessResult>;
  getOrder(reference: string): Promise<OrderView>;
  joinWaitlist(submission: WaitlistSubmission): Promise<SubmissionReceipt>;
  sendContact(submission: ContactSubmission): Promise<SubmissionReceipt>;
}

export type OffmarkDataSource = PublicContentReader & CommerceGateway;
