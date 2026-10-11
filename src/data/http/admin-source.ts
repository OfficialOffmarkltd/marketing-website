"use client";

import { parseSafeError } from "@/data/validation";
import { DataContractError, DataSourceError } from "@/domain/errors";

export type StaffRole = "admin" | "staff";
export type StaffUser = {
  id: string;
  email: string;
  role: StaffRole;
  createdAt: string;
};
export type AuthResponse = { user: StaffUser; accessToken: string };

let accessToken: string | null = null;

export class AdminHttpClient {
  private readonly baseUrl: string;

  constructor(origin: string) {
    this.baseUrl = new URL("/api/v1/", origin).toString();
  }

  private async raw(
    path: string,
    init: RequestInit = {},
    retry = true,
  ): Promise<unknown> {
    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      credentials: "include",
      signal: init.signal ?? AbortSignal.timeout(10_000),
      headers: {
        accept: "application/json",
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...init.headers,
      },
    }).catch(() => {
      throw new DataSourceError({
        code: "temporary_failure",
        message: "The Offmark admin API could not be reached.",
      });
    });
    if (response.status === 401 && retry && !path.startsWith("auth/")) {
      await this.refresh();
      return this.raw(path, init, false);
    }
    if (!response.ok) {
      const payload: unknown = await response.json().catch(() => null);
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
          code: response.status === 403 ? "forbidden" : "temporary_failure",
          message: "The admin API returned an unexpected response.",
          requestId: response.headers.get("x-request-id") ?? undefined,
        });
      }
    }
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return null;
    }
    return response.json() as Promise<unknown>;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const payload = (await this.raw(
      "auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false,
    )) as Partial<AuthResponse>;
    if (!payload.accessToken || !payload.user) {
      throw new DataContractError("Staff login response is invalid.");
    }
    accessToken = payload.accessToken;
    return payload as AuthResponse;
  }

  async refresh() {
    const payload = (await this.raw(
      "auth/refresh",
      { method: "POST" },
      false,
    )) as {
      accessToken?: unknown;
    };
    if (typeof payload?.accessToken !== "string") {
      throw new DataContractError("Staff refresh response is invalid.");
    }
    accessToken = payload.accessToken;
    return payload.accessToken;
  }

  async logout() {
    await this.raw("auth/logout", { method: "POST" }, false);
    accessToken = null;
  }

  list(
    section: string,
    orderFilters?: { paymentState?: string; fulfillmentState?: string },
  ) {
    const paths: Record<string, string> = {
      "catalog/drops": "admin/drops",
      "catalog/designs": "admin/designs",
      services: "admin/services",
      "content/building": "admin/build-updates",
      "content/policies": "admin/policies",
      orders: "admin/orders",
      users: "admin/users",
    };
    const path = paths[section] ?? "admin/orders?pageSize=5";
    if (section !== "orders" || !orderFilters) return this.raw(path);
    const query = new URLSearchParams();
    if (orderFilters.paymentState)
      query.set("paymentState", orderFilters.paymentState);
    if (orderFilters.fulfillmentState)
      query.set("fulfillmentState", orderFilters.fulfillmentState);
    const suffix = query.size ? `?${query}` : "";
    return this.raw(`${path}${suffix}`);
  }

  getOrder(reference: string) {
    return this.raw(`admin/orders/${encodeURIComponent(reference)}`);
  }

  mutate(path: string, method: "POST" | "PATCH", body?: unknown) {
    return this.raw(path, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
}
