import type { Money } from "@/domain/catalog";
import type {
  BagLine,
  CheckoutQuote,
  CheckoutSessionRequest,
  ContactSubmission,
  OrderAccessRequest,
  ValidatedBag,
  ValidatedBagLine,
  WaitlistSubmission,
} from "@/domain/commerce";
import { DataSourceError } from "@/domain/errors";
import { MemoryDataSource } from "../memory-source";
import {
  demoBuildUpdates,
  demoDesigns,
  demoDrops,
  demoPolicies,
  demoServices,
} from "./fixtures";
import type { DemoScenario } from "./scenarios";

const zero: Money = { amountMinor: 0, currency: "NGN" };

function add(...values: Money[]): Money {
  return {
    amountMinor: values.reduce((sum, item) => sum + item.amountMinor, 0),
    currency: "NGN",
  };
}

export class DemoDataSource extends MemoryDataSource {
  constructor(readonly scenario: DemoScenario = "success") {
    super({
      services: demoServices,
      drops: demoDrops,
      designs: demoDesigns,
      buildUpdates: demoBuildUpdates,
      policies: demoPolicies,
    });
  }

  private async beforeOperation() {
    if (this.scenario === "loading") {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    if (this.scenario === "temporary_failure") {
      throw new DataSourceError({
        code: "temporary_failure",
        message: "The simulated service is temporarily unavailable.",
        requestId: "demo-request-temporary-failure",
      });
    }
  }

  override async listDrops() {
    await this.beforeOperation();
    if (this.scenario === "empty") return [];
    return super.listDrops();
  }

  override async listBuildUpdates() {
    await this.beforeOperation();
    if (this.scenario === "empty") return [];
    return super.listBuildUpdates();
  }

  override async validateBag(lines: BagLine[]): Promise<ValidatedBag> {
    await this.beforeOperation();
    const validated: ValidatedBagLine[] = [];

    for (const line of lines) {
      const design = demoDesigns.find((item) => item.id === line.designId);
      const variant = design?.variants.find(
        (item) => item.id === line.variantId,
      );
      const drop = demoDrops.find((item) => item.id === design?.dropId);
      if (!design || !variant || !drop || !design.price) continue;

      const unavailable =
        this.scenario === "unavailable" ||
        !variant.available ||
        drop.status === "retired";
      validated.push({
        design,
        drop,
        variant,
        quantity: line.quantity,
        lineTotal: {
          amountMinor: design.price.amountMinor * line.quantity,
          currency: "NGN",
        },
        changes: unavailable
          ? ["unavailable"]
          : this.scenario === "price_changed"
            ? ["price_changed"]
            : [],
      });
    }

    const subtotal = validated.reduce(
      (current, line) => add(current, line.lineTotal),
      zero,
    );
    return {
      lines: validated,
      subtotal,
      validForCheckout:
        validated.length === lines.length &&
        validated.length > 0 &&
        validated.every((line) => line.changes.length === 0),
    };
  }

  override async createQuote(lines: BagLine[]): Promise<CheckoutQuote> {
    const bag = await this.validateBag(lines);
    if (!bag.validForCheckout) {
      throw new DataSourceError({
        code:
          this.scenario === "price_changed" ? "price_changed" : "unavailable",
        message:
          this.scenario === "price_changed"
            ? "The simulated price changed. Review the updated bag."
            : "A simulated item is unavailable.",
      });
    }
    const delivery = { amountMinor: 250000, currency: "NGN" } as const;
    return {
      id: "demo-quote-001",
      expiresAt:
        this.scenario === "expired_quote"
          ? "2020-01-01T00:00:00.000Z"
          : "2099-01-01T00:00:00.000Z",
      lines: bag.lines,
      subtotal: bag.subtotal,
      delivery,
      total: add(bag.subtotal, delivery),
      acceptedPolicyVersions: { preorder: "demo-1" },
      requiresAcknowledgement: false,
    };
  }

  override async beginCheckout(_request: CheckoutSessionRequest) {
    await this.beforeOperation();
    if (this.scenario === "expired_quote") {
      throw new DataSourceError({
        code: "quote_expired",
        message: "The simulated quote expired. Request a new total.",
      });
    }
    return {
      orderReference: "DEMO-ORDER-001",
      paymentState:
        this.scenario === "payment_failed"
          ? ("failed" as const)
          : this.scenario === "payment_confirmed"
            ? ("confirmed" as const)
            : ("pending" as const),
      simulated: true,
    };
  }

  override async requestOrderAccess(_request: OrderAccessRequest) {
    await this.beforeOperation();
    return { acknowledged: true as const, simulated: true };
  }

  override async redeemOrderAccess(_token: string) {
    await this.beforeOperation();
    if (this.scenario === "access_expired") {
      throw new DataSourceError({
        code: "unauthorized",
        message: "The simulated access link is expired or invalid.",
      });
    }
    return { authorized: true as const, simulated: true };
  }

  override async getOrder(_reference: string) {
    await this.beforeOperation();
    const bag = await this.validateBag([
      {
        designId: "demo-design-one",
        variantId: "demo-variant-one-s",
        quantity: 1,
      },
    ]);
    const delivery = { amountMinor: 250000, currency: "NGN" } as const;
    return {
      reference: "DEMO-ORDER-001",
      placedAt: "2026-09-03T10:00:00+01:00",
      paymentState:
        this.scenario === "payment_failed"
          ? ("failed" as const)
          : this.scenario === "payment_pending"
            ? ("pending" as const)
            : ("paid" as const),
      fulfillmentState: "awaiting_production" as const,
      lines: bag.lines,
      subtotal: bag.subtotal,
      delivery,
      total: add(bag.subtotal, delivery),
      estimatedDispatchText:
        "Fictional dispatch estimate for interface review.",
      events: [
        {
          occurredAt: "2026-09-03T10:00:00+01:00",
          label: "Sample order created",
          detail: "No real order or payment exists.",
        },
      ],
      simulated: true,
    };
  }

  override async joinWaitlist(_submission: WaitlistSubmission) {
    await this.beforeOperation();
    return { acknowledged: true as const, simulated: true };
  }

  override async sendContact(_submission: ContactSubmission) {
    await this.beforeOperation();
    return { acknowledged: true as const, simulated: true };
  }
}
