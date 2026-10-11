import assert from "node:assert/strict";
import { DemoDataSource } from "../src/data/demo/source";
import { AdminHttpClient } from "../src/data/http/admin-source";
import { HttpDataSource } from "../src/data/http/source";

const demo = new DemoDataSource("success");
const lines = [
  {
    designId: "demo-design-one",
    variantId: "demo-variant-one-s",
    quantity: 1,
  },
];
const quote = await demo.createQuote(lines);
const requests: { path: string; method: string; authorization?: string }[] = [];

const payloads: Record<string, unknown> = {
  "GET /api/v1/services": await demo.listServices(),
  "GET /api/v1/drops": await demo.listDrops(),
  "GET /api/v1/drops/demo-open-drop": await demo.getDrop("demo-open-drop"),
  "GET /api/v1/designs/demo-design-one":
    await demo.getDesign("demo-design-one"),
  "GET /api/v1/build-updates": await demo.listBuildUpdates(),
  "GET /api/v1/build-updates/sample-published-update":
    await demo.getBuildUpdate("sample-published-update"),
  "GET /api/v1/policies/sample-preorder-policy": await demo.getPolicy(
    "sample-preorder-policy",
  ),
  "POST /api/v1/bag/validate": await demo.validateBag(lines),
  "POST /api/v1/checkout/quotes": quote,
  "POST /api/v1/checkout/sessions": await demo.beginCheckout({
    quoteId: quote.id,
    contact: {
      email: "preview@example.test",
      deliveryAddress: {
        recipientName: "Preview Person",
        line1: "1 Preview Street",
        city: "Lagos",
        state: "Lagos",
        countryCode: "NG",
        phone: "08000000000",
      },
    },
    acceptedPolicyVersions: quote.acceptedPolicyVersions,
    idempotencyKey: "11111111-1111-4111-8111-111111111111",
  }),
  "POST /api/v1/order-access/requests": {
    acknowledged: true,
    simulated: false,
  },
  "POST /api/v1/order-access/redeem": {
    authorized: true,
    simulated: false,
  },
  "GET /api/v1/orders/DEMO-ORDER-001": await demo.getOrder("DEMO-ORDER-001"),
  "POST /api/v1/waitlist": { acknowledged: true, simulated: false },
  "POST /api/v1/contact": { acknowledged: true, simulated: false },
  "POST /api/v1/auth/login": {
    user: {
      id: "11111111-1111-4111-8111-111111111111",
      email: "admin@offmark.test",
      role: "admin",
      createdAt: new Date(0).toISOString(),
    },
    accessToken: "test-access-token",
  },
  "POST /api/v1/auth/refresh": { accessToken: "refreshed-access-token" },
  "POST /api/v1/auth/logout": null,
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input.toString());
  const method = init?.method ?? "GET";
  const headers = new Headers(init?.headers);
  requests.push({
    path: url.pathname + url.search,
    method,
    authorization: headers.get("authorization") ?? undefined,
  });
  const key = `${method} ${url.pathname}`;
  const payload = Object.hasOwn(payloads, key)
    ? payloads[key]
    : url.pathname.startsWith("/api/v1/admin/")
      ? []
      : undefined;
  assert.notEqual(payload, undefined, `Unexpected request: ${key}`);
  return Response.json(payload, { status: 200 });
};

try {
  const source = new HttpDataSource("https://api.offmark.test");
  await source.listServices();
  await source.listDrops();
  await source.getDrop("demo-open-drop");
  await source.getDesign("demo-design-one");
  await source.listBuildUpdates();
  await source.getBuildUpdate("sample-published-update");
  await source.getPolicy("sample-preorder-policy");
  await source.validateBag(lines);
  await source.createQuote(lines);
  await source.beginCheckout({
    quoteId: quote.id,
    contact: {
      email: "preview@example.test",
      deliveryAddress: {
        recipientName: "Preview Person",
        line1: "1 Preview Street",
        city: "Lagos",
        state: "Lagos",
        countryCode: "NG",
        phone: "08000000000",
      },
    },
    acceptedPolicyVersions: quote.acceptedPolicyVersions,
    idempotencyKey: "11111111-1111-4111-8111-111111111111",
  });
  await source.requestOrderAccess({
    email: "preview@example.test",
    reference: "DEMO-ORDER-001",
  });
  await source.redeemOrderAccess("a".repeat(64));
  await source.getOrder("DEMO-ORDER-001");
  await source.joinWaitlist({
    email: "preview@example.test",
    serviceId: "seam",
    consent: true,
  });
  await source.sendContact({
    name: "Preview Person",
    email: "preview@example.test",
    subject: "Question",
    message: "A contract test enquiry.",
  });

  const admin = new AdminHttpClient("https://api.offmark.test");
  await admin.login("admin@offmark.test", "preview-only");
  for (const section of [
    "",
    "catalog/drops",
    "catalog/designs",
    "services",
    "content/building",
    "content/policies",
    "orders",
    "users",
  ]) {
    await admin.list(section);
  }
  await admin.getOrder("OM-TEST");
  for (const [path, method] of [
    ["admin/drops", "POST"],
    ["admin/drops/id", "PATCH"],
    ["admin/drops/id/publish", "POST"],
    ["admin/drops/id/close", "POST"],
    ["admin/drops/id/retire", "POST"],
    ["admin/designs", "POST"],
    ["admin/designs/id", "PATCH"],
    ["admin/designs/variants", "POST"],
    ["admin/designs/variants/id", "PATCH"],
    ["admin/services/id", "PATCH"],
    ["admin/build-updates", "POST"],
    ["admin/build-updates/id", "PATCH"],
    ["admin/build-updates/id/publish", "POST"],
    ["admin/policies", "POST"],
    ["admin/policies/id", "PATCH"],
    ["admin/policies/id/publish", "POST"],
    ["admin/orders/OM-TEST/fulfill", "POST"],
    ["admin/users", "POST"],
    ["admin/users/id", "PATCH"],
  ] as const) {
    await admin.mutate(path, method, {});
  }
  await admin.refresh();
  await admin.logout();

  const adminRequests = requests.filter((request) =>
    request.path.startsWith("/api/v1/admin/"),
  );
  assert(adminRequests.length >= 28);
  assert(
    adminRequests.every(
      (request) => request.authorization === "Bearer test-access-token",
    ),
    "Every admin request must carry the in-memory access token.",
  );
  console.log(
    `Live adapter contract checks passed (${requests.length} requests).`,
  );
} finally {
  globalThis.fetch = originalFetch;
}
