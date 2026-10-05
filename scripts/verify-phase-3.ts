import assert from "node:assert/strict";
import {
  demoBuildUpdates,
  demoDesigns,
  demoDrops,
  demoServices,
} from "../src/data/demo/fixtures";
import { demoScenarioNames } from "../src/data/demo/scenarios";
import { DemoDataSource } from "../src/data/demo/source";
import { HttpDataSource } from "../src/data/http/source";
import { MemoryDataSource } from "../src/data/memory-source";
import { readDataConfiguration } from "../src/data/mode";
import { PublicDataSource } from "../src/data/public-source";
import {
  parseBagStorage,
  parseBuildUpdateList,
  parseDesign,
  parseDrop,
  parseDropList,
  parseSafeError,
  parseServiceList,
} from "../src/data/validation";
import { DataContractError, DataSourceError } from "../src/domain/errors";
import { formatMoney, formatPublishedDate, isSlug } from "../src/domain/format";

const sampleLine = {
  designId: "demo-design-one",
  variantId: "demo-variant-one-s",
  quantity: 1,
};

async function expectCode(
  operation: () => Promise<unknown>,
  code: DataSourceError["code"],
) {
  await assert.rejects(operation, (error: unknown) => {
    assert(error instanceof DataSourceError);
    assert.equal(error.code, code);
    return true;
  });
}

async function main() {
  const publicSource = new PublicDataSource();
  const publicServices = await publicSource.listServices();
  assert.deepEqual(
    publicServices.map((service) => service.slug),
    ["seam", "marketplace", "drip"],
  );
  assert(
    publicServices.every((service) => service.availability === "unconfirmed"),
  );
  assert.equal((await publicSource.listDrops()).length, 0);
  assert.equal((await publicSource.listBuildUpdates()).length, 0);
  await expectCode(() => publicSource.validateBag([sampleLine]), "unavailable");

  const demo = new DemoDataSource("success");
  assert.equal(parseServiceList(demoServices).length, 3);
  assert.equal(parseDropList(demoDrops).length, 3);
  assert.equal(parseBuildUpdateList(demoBuildUpdates).length, 4);
  assert.equal(parseDesign(demoDesigns[0]).id, "demo-design-one");
  const drops = await demo.listDrops();
  assert.equal(drops.length, 2);
  assert(!drops.some((drop) => drop.status === "draft"));
  assert(drops.every((drop) => drop.provenance.kind === "demo"));
  assert(drops.every((drop) => !drop.provenance.publishable));
  assert.equal(await demo.getDrop("demo-draft-drop"), null);
  class OrphanDesignSource extends MemoryDataSource {
    constructor() {
      super({
        services: [],
        drops: [],
        designs: [demoDesigns[0]],
        buildUpdates: [],
        policies: [],
      });
    }
  }
  assert.equal(
    await new OrphanDesignSource().getDesign("demo-design-one"),
    null,
  );
  assert.equal((await demo.listBuildUpdates()).length, 3);
  assert.equal(await demo.getBuildUpdate("sample-hidden-draft"), null);
  assert.equal(await demo.getPolicy("sample-hidden-policy"), null);

  const validated = await demo.validateBag([sampleLine]);
  assert(validated.validForCheckout);
  assert.equal(validated.subtotal.amountMinor, 4_850_000);
  const quote = await demo.createQuote([sampleLine]);
  assert.equal(quote.total.amountMinor, 5_100_000);
  assert.equal(quote.acceptedPolicyVersions.preorder, "demo-1");

  const checkoutRequest = {
    quoteId: quote.id,
    contact: {
      email: "fictional@example.invalid",
      deliveryAddress: {
        recipientName: "Fictional Customer",
        line1: "1 Preview Street",
        city: "Lagos",
        state: "Lagos",
        countryCode: "NG" as const,
        phone: "+2340000000000",
      },
    },
    acceptedPolicyVersions: quote.acceptedPolicyVersions,
    idempotencyKey: "demo-idempotency-key",
  };
  assert.equal((await demo.beginCheckout(checkoutRequest)).simulated, true);
  assert.equal((await demo.getOrder("DEMO-ORDER-001")).simulated, true);
  assert.equal(
    (
      await demo.sendContact({
        name: "Fictional Customer",
        email: "fictional@example.invalid",
        subject: "Preview",
        message: "No message is sent.",
      })
    ).simulated,
    true,
  );

  assert.equal((await new DemoDataSource("empty").listDrops()).length, 0);
  assert.equal(
    (await new DemoDataSource("unavailable").validateBag([sampleLine]))
      .validForCheckout,
    false,
  );
  await expectCode(
    () => new DemoDataSource("price_changed").createQuote([sampleLine]),
    "price_changed",
  );
  await expectCode(
    () => new DemoDataSource("expired_quote").beginCheckout(checkoutRequest),
    "quote_expired",
  );
  assert.equal(
    (await new DemoDataSource("payment_pending").beginCheckout(checkoutRequest))
      .paymentState,
    "pending",
  );
  assert.equal(
    (await new DemoDataSource("payment_failed").beginCheckout(checkoutRequest))
      .paymentState,
    "failed",
  );
  assert.equal(
    (
      await new DemoDataSource("payment_confirmed").beginCheckout(
        checkoutRequest,
      )
    ).paymentState,
    "confirmed",
  );
  await expectCode(
    () => new DemoDataSource("access_expired").redeemOrderAccess("demo-token"),
    "unauthorized",
  );
  await expectCode(
    () => new DemoDataSource("temporary_failure").listDrops(),
    "temporary_failure",
  );

  const loadingStarted = performance.now();
  await new DemoDataSource("loading").listDrops();
  assert(performance.now() - loadingStarted >= 500);
  assert.equal(demoScenarioNames.length, 11);

  assert.deepEqual(parseBagStorage({ version: 1, lines: [sampleLine] }), {
    version: 1,
    lines: [sampleLine],
  });
  assert.throws(
    () => parseBagStorage({ version: 2, lines: [] }),
    DataContractError,
  );
  assert.throws(
    () =>
      parseBagStorage({ version: 1, lines: [{ ...sampleLine, quantity: 0 }] }),
    DataContractError,
  );
  assert.throws(() => parseDrop({ slug: "Bad Slug" }), DataContractError);
  assert.throws(() => parseDesign({}), DataContractError);
  assert.throws(() => parseServiceList([{}]), DataContractError);
  assert.deepEqual(
    parseSafeError({
      code: "invalid_data",
      message: "Review the fields.",
      fieldErrors: { email: ["Enter a valid email."] },
      requestId: "request-1",
    }).fieldErrors,
    { email: ["Enter a valid email."] },
  );

  const originalFetch = globalThis.fetch;
  const fallbackSignals: (AbortSignal | null)[] = [];
  globalThis.fetch = async (_input, init) => {
    fallbackSignals.push(init?.signal ?? null);
    return Response.json({ unexpected: true }, { status: 200 });
  };
  await expectCode(
    () => new HttpDataSource("https://api.example.test").listDrops(),
    "invalid_data",
  );
  assert(fallbackSignals[0] instanceof AbortSignal);

  const suppliedSignal = new AbortController().signal;
  const source = new HttpDataSource("https://api.example.test") as unknown as {
    request<T>(
      path: string,
      parser: (value: unknown) => T,
      init?: RequestInit,
    ): Promise<T | null>;
  };
  globalThis.fetch = async (_input, init) => {
    assert.equal(init?.signal, suppliedSignal);
    throw new DOMException("Aborted", "AbortError");
  };
  await expectCode(
    () => source.request("drops", () => [], { signal: suppliedSignal }),
    "temporary_failure",
  );
  globalThis.fetch = originalFetch;

  assert.equal(isSlug("sample-drop"), true);
  assert.equal(isSlug("Sample Drop"), false);
  assert(
    formatMoney({ amountMinor: 4_850_000, currency: "NGN" }).includes("48,500"),
  );
  assert(formatPublishedDate("2026-09-01T09:00:00+01:00").includes("2026"));

  assert.deepEqual(readDataConfiguration({ NODE_ENV: "development" }), {
    mode: "public",
  });
  assert.deepEqual(
    readDataConfiguration({
      NODE_ENV: "development",
      OFFMARK_DATA_MODE: "demo",
      OFFMARK_DEMO_SCENARIO: "empty",
    }),
    { mode: "demo", scenario: "empty" },
  );
  assert.deepEqual(
    readDataConfiguration({
      NODE_ENV: "production",
      OFFMARK_DATA_MODE: "live",
      OFFMARK_API_ORIGIN: "https://api.example.test/path-is-removed",
    }),
    { mode: "live", apiOrigin: "https://api.example.test" },
  );
  assert.throws(
    () =>
      readDataConfiguration({
        NODE_ENV: "production",
        OFFMARK_DATA_MODE: "demo",
      }),
    DataSourceError,
  );
  assert.throws(
    () =>
      readDataConfiguration({
        NODE_ENV: "production",
        OFFMARK_DATA_MODE: "live",
      }),
    DataSourceError,
  );

  console.log("Phase 3 data-contract checks passed.");
}

await main();
