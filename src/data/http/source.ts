import type {
  BagLine,
  CheckoutSessionRequest,
  ContactSubmission,
  OrderAccessRequest,
  WaitlistSubmission,
} from "@/domain/commerce";
import { DataContractError, DataSourceError } from "@/domain/errors";
import type { OffmarkDataSource } from "../contracts";
import {
  parseBuildUpdate,
  parseBuildUpdateList,
  parseCheckoutQuote,
  parseCheckoutResult,
  parseDesign,
  parseDrop,
  parseDropList,
  parseOrderView,
  parsePolicy,
  parseSafeError,
  parseServiceList,
  parseValidatedBag,
} from "../validation";

type Parser<T> = (value: unknown) => T;

function object(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new DataContractError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function receipt(value: unknown) {
  const item = object(value, "receipt");
  if (item.acknowledged !== true || typeof item.simulated !== "boolean") {
    throw new DataContractError("Receipt fields are invalid.");
  }
  return { acknowledged: true as const, simulated: item.simulated };
}

function accessRedemption(value: unknown) {
  const item = object(value, "access redemption");
  if (item.authorized !== true || typeof item.simulated !== "boolean") {
    throw new DataContractError("Access redemption fields are invalid.");
  }
  return { authorized: true as const, simulated: item.simulated };
}

export class HttpDataSource implements OffmarkDataSource {
  private readonly baseUrl: string;

  constructor(origin: string) {
    this.baseUrl = new URL("/api/v1/", origin).toString();
  }

  private async request<T>(
    path: string,
    parser: Parser<T>,
    init?: RequestInit,
    allowNotFound = false,
  ): Promise<T | null> {
    let response: Response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(10_000),
        credentials: "include",
        headers: {
          accept: "application/json",
          ...(init?.body ? { "content-type": "application/json" } : {}),
          ...init?.headers,
        },
      });
    } catch {
      throw new DataSourceError({
        code: "temporary_failure",
        message: "The Offmark service could not be reached.",
      });
    }

    if (allowNotFound && response.status === 404) return null;
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      try {
        throw new DataSourceError(parseSafeError(payload));
      } catch (error) {
        if (
          error instanceof DataSourceError &&
          error.name !== "DataContractError"
        ) {
          throw error;
        }
        throw new DataSourceError({
          code: response.status === 401 ? "unauthorized" : "temporary_failure",
          message: "The Offmark service returned an unexpected response.",
          requestId: response.headers.get("x-request-id") ?? undefined,
        });
      }
    }
    return parser(payload);
  }

  async listServices() {
    return (await this.request("services", parseServiceList)) ?? [];
  }
  async listDrops() {
    return (await this.request("drops", parseDropList)) ?? [];
  }
  async getDrop(slug: string) {
    return this.request(
      `drops/${encodeURIComponent(slug)}`,
      parseDrop,
      undefined,
      true,
    );
  }
  async getDesign(id: string) {
    return this.request(
      `designs/${encodeURIComponent(id)}`,
      parseDesign,
      undefined,
      true,
    );
  }
  async listBuildUpdates() {
    return (await this.request("build-updates", parseBuildUpdateList)) ?? [];
  }
  async getBuildUpdate(slug: string) {
    return this.request(
      `build-updates/${encodeURIComponent(slug)}`,
      parseBuildUpdate,
      undefined,
      true,
    );
  }
  async getPolicy(slug: string) {
    return this.request(
      `policies/${encodeURIComponent(slug)}`,
      parsePolicy,
      undefined,
      true,
    );
  }
  async validateBag(lines: BagLine[]) {
    const result = await this.request("bag/validate", parseValidatedBag, {
      method: "POST",
      body: JSON.stringify({ lines }),
    });
    if (!result)
      throw new DataContractError("Bag validation returned no data.");
    return result;
  }
  async createQuote(lines: BagLine[]) {
    const result = await this.request("checkout/quotes", parseCheckoutQuote, {
      method: "POST",
      body: JSON.stringify({ lines }),
    });
    if (!result)
      throw new DataContractError("Checkout quote returned no data.");
    return result;
  }
  async beginCheckout(request: CheckoutSessionRequest) {
    const result = await this.request(
      "checkout/sessions",
      parseCheckoutResult,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!result) throw new DataContractError("Checkout returned no data.");
    return result;
  }
  async requestOrderAccess(request: OrderAccessRequest) {
    const result = await this.request("order-access/requests", receipt, {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!result) throw new DataContractError("Order access returned no data.");
    return result;
  }
  async redeemOrderAccess(token: string) {
    const result = await this.request("order-access/redeem", accessRedemption, {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (!result)
      throw new DataContractError("Access redemption returned no data.");
    return result;
  }
  async getOrder(reference: string) {
    const result = await this.request(
      `orders/${encodeURIComponent(reference)}`,
      parseOrderView,
    );
    if (!result) throw new DataContractError("Order lookup returned no data.");
    return result;
  }
  async joinWaitlist(submission: WaitlistSubmission) {
    const result = await this.request("waitlist", receipt, {
      method: "POST",
      body: JSON.stringify(submission),
    });
    if (!result) throw new DataContractError("Waitlist returned no data.");
    return result;
  }
  async sendContact(submission: ContactSubmission) {
    const result = await this.request("contact", receipt, {
      method: "POST",
      body: JSON.stringify(submission),
    });
    if (!result)
      throw new DataContractError("Contact submission returned no data.");
    return result;
  }
}
