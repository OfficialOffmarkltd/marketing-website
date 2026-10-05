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
import { DataSourceError } from "@/domain/errors";
import type { OffmarkDataSource } from "./contracts";

export type MemoryContent = {
  services: Service[];
  drops: Drop[];
  designs: Design[];
  buildUpdates: BuildUpdate[];
  policies: Policy[];
};

export abstract class MemoryDataSource implements OffmarkDataSource {
  protected constructor(protected readonly content: MemoryContent) {}

  async listServices() {
    return this.content.services;
  }

  async listDrops() {
    return this.content.drops.filter((item) => item.status !== "draft");
  }

  async getDrop(slug: string) {
    return (
      this.content.drops.find(
        (item) => item.slug === slug && item.status !== "draft",
      ) ?? null
    );
  }

  async getDesign(id: string) {
    const design = this.content.designs.find((item) => item.id === id);
    if (!design) return null;
    const drop = this.content.drops.find((item) => item.id === design.dropId);
    return !drop || drop.status === "draft" ? null : design;
  }

  async listBuildUpdates() {
    return this.content.buildUpdates
      .filter((item) => item.publicationStatus === "published")
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  }

  async getBuildUpdate(slug: string) {
    return (
      this.content.buildUpdates.find(
        (item) => item.slug === slug && item.publicationStatus === "published",
      ) ?? null
    );
  }

  async getPolicy(slug: string) {
    return (
      this.content.policies.find(
        (item) => item.slug === slug && item.publicationStatus === "published",
      ) ?? null
    );
  }

  protected unavailable(operation: string): never {
    throw new DataSourceError({
      code: "unavailable",
      message: `${operation} is not available in this website mode.`,
    });
  }

  async validateBag(_lines: BagLine[]): Promise<ValidatedBag> {
    return this.unavailable("Bag validation");
  }
  async createQuote(_lines: BagLine[]): Promise<CheckoutQuote> {
    return this.unavailable("Checkout quoting");
  }
  async beginCheckout(
    _request: CheckoutSessionRequest,
  ): Promise<CheckoutResult> {
    return this.unavailable("Checkout");
  }
  async requestOrderAccess(
    _request: OrderAccessRequest,
  ): Promise<OrderAccessReceipt> {
    return this.unavailable("Order access");
  }
  async redeemOrderAccess(_token: string): Promise<RedeemOrderAccessResult> {
    return this.unavailable("Order access redemption");
  }
  async getOrder(_reference: string): Promise<OrderView> {
    return this.unavailable("Order lookup");
  }
  async joinWaitlist(
    _submission: WaitlistSubmission,
  ): Promise<SubmissionReceipt> {
    return this.unavailable("Waitlist submission");
  }
  async sendContact(
    _submission: ContactSubmission,
  ): Promise<SubmissionReceipt> {
    return this.unavailable("Contact submission");
  }
}
