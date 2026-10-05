import type {
  Asset,
  BuildUpdate,
  Design,
  Drop,
  Money,
  Policy,
  RecordProvenance,
  Service,
  Variant,
} from "@/domain/catalog";
import type {
  BagLine,
  BagStorage,
  CheckoutQuote,
  CheckoutResult,
  OrderView,
  ValidatedBag,
  ValidatedBagLine,
} from "@/domain/commerce";
import { DataContractError, type SafeDataError } from "@/domain/errors";
import { isSlug } from "@/domain/format";

type JsonRecord = Record<string, unknown>;

function fail(path: string, expectation: string): never {
  throw new DataContractError(`${path} must be ${expectation}.`);
}

function record(value: unknown, path: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail(path, "an object");
  }
  return value as JsonRecord;
}

function string(value: unknown, path: string) {
  if (typeof value !== "string" || value.trim() === "") {
    return fail(path, "a non-empty string");
  }
  return value;
}

function optionalString(value: unknown, path: string) {
  return value === undefined ? undefined : string(value, path);
}

function boolean(value: unknown, path: string) {
  if (typeof value !== "boolean") return fail(path, "a boolean");
  return value;
}

function integer(value: unknown, path: string, minimum = 0) {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) {
    return fail(path, `a safe integer greater than or equal to ${minimum}`);
  }
  return value as number;
}

function array<T>(
  value: unknown,
  path: string,
  parser: (item: unknown, itemPath: string) => T,
) {
  if (!Array.isArray(value)) return fail(path, "an array");
  return value.map((item, index) => parser(item, `${path}[${index}]`));
}

function enumeration<T extends string>(
  value: unknown,
  path: string,
  values: readonly T[],
) {
  if (typeof value !== "string" || !values.includes(value as T)) {
    return fail(path, `one of: ${values.join(", ")}`);
  }
  return value as T;
}

function isoDate(value: unknown, path: string) {
  const result = string(value, path);
  if (Number.isNaN(Date.parse(result))) return fail(path, "an ISO date string");
  return result;
}

function slug(value: unknown, path: string) {
  const result = string(value, path);
  if (!isSlug(result)) return fail(path, "a lowercase kebab-case slug");
  return result;
}

function provenance(value: unknown, path: string): RecordProvenance {
  const item = record(value, path);
  const kind = enumeration(item.kind, `${path}.kind`, ["approved", "demo"]);
  const publishable = boolean(item.publishable, `${path}.publishable`);
  if (kind === "demo" && publishable) {
    return fail(path, "non-publishable when its kind is demo");
  }
  return {
    kind,
    publishable,
    label: optionalString(item.label, `${path}.label`),
  };
}

export function parseMoney(value: unknown, path = "money"): Money {
  const item = record(value, path);
  return {
    amountMinor: integer(item.amountMinor, `${path}.amountMinor`),
    currency: enumeration(item.currency, `${path}.currency`, ["NGN"]),
  };
}

export function parseAsset(value: unknown, path = "asset"): Asset {
  const item = record(value, path);
  return {
    src: string(item.src, `${path}.src`),
    alt:
      typeof item.alt === "string" ? item.alt : fail(`${path}.alt`, "a string"),
    width: integer(item.width, `${path}.width`, 1),
    height: integer(item.height, `${path}.height`, 1),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parseService(value: unknown, path = "service"): Service {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    slug: enumeration(item.slug, `${path}.slug`, [
      "seam",
      "marketplace",
      "drip",
    ]),
    name: string(item.name, `${path}.name`),
    summary: string(item.summary, `${path}.summary`),
    availability: enumeration(item.availability, `${path}.availability`, [
      "live",
      "beta",
      "in_development",
      "unconfirmed",
    ]),
    destination: optionalString(item.destination, `${path}.destination`),
    screenshot:
      item.screenshot === undefined
        ? undefined
        : parseAsset(item.screenshot, `${path}.screenshot`),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parseDrop(value: unknown, path = "drop"): Drop {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    slug: slug(item.slug, `${path}.slug`),
    name: string(item.name, `${path}.name`),
    story: string(item.story, `${path}.story`),
    status: enumeration(item.status, `${path}.status`, [
      "draft",
      "open",
      "closing",
      "retired",
    ]),
    designIds: array(item.designIds, `${path}.designIds`, string),
    closesAt:
      item.closesAt === undefined
        ? undefined
        : isoDate(item.closesAt, `${path}.closesAt`),
    campaignImage:
      item.campaignImage === undefined
        ? undefined
        : parseAsset(item.campaignImage, `${path}.campaignImage`),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parseVariant(value: unknown, path = "variant"): Variant {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    size: string(item.size, `${path}.size`),
    colour: string(item.colour, `${path}.colour`),
    available: boolean(item.available, `${path}.available`),
    unavailableReason: optionalString(
      item.unavailableReason,
      `${path}.unavailableReason`,
    ),
  };
}

export function parseDesign(value: unknown, path = "design"): Design {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    dropId: string(item.dropId, `${path}.dropId`),
    slug: slug(item.slug, `${path}.slug`),
    name: string(item.name, `${path}.name`),
    price:
      item.price === undefined
        ? undefined
        : parseMoney(item.price, `${path}.price`),
    images: array(item.images, `${path}.images`, parseAsset),
    materials: string(item.materials, `${path}.materials`),
    fit: string(item.fit, `${path}.fit`),
    care: string(item.care, `${path}.care`),
    variants: array(item.variants, `${path}.variants`, parseVariant),
    estimatedDispatchText: string(
      item.estimatedDispatchText,
      `${path}.estimatedDispatchText`,
    ),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parseBuildUpdate(
  value: unknown,
  path = "buildUpdate",
): BuildUpdate {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    slug: slug(item.slug, `${path}.slug`),
    publishedAt: isoDate(item.publishedAt, `${path}.publishedAt`),
    product: string(item.product, `${path}.product`),
    title: string(item.title, `${path}.title`),
    summary: string(item.summary, `${path}.summary`),
    body: string(item.body, `${path}.body`),
    kind: enumeration(item.kind, `${path}.kind`, [
      "released",
      "demo",
      "work_in_progress",
    ]),
    evidenceUrl: optionalString(item.evidenceUrl, `${path}.evidenceUrl`),
    publicationStatus: enumeration(
      item.publicationStatus,
      `${path}.publicationStatus`,
      ["draft", "published"],
    ),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parsePolicy(value: unknown, path = "policy"): Policy {
  const item = record(value, path);
  return {
    id: string(item.id, `${path}.id`),
    slug: slug(item.slug, `${path}.slug`),
    title: string(item.title, `${path}.title`),
    version: string(item.version, `${path}.version`),
    effectiveAt: isoDate(item.effectiveAt, `${path}.effectiveAt`),
    body: string(item.body, `${path}.body`),
    publicationStatus: enumeration(
      item.publicationStatus,
      `${path}.publicationStatus`,
      ["draft", "published"],
    ),
    provenance: provenance(item.provenance, `${path}.provenance`),
  };
}

export function parseBagLine(value: unknown, path = "bagLine"): BagLine {
  const item = record(value, path);
  return {
    designId: string(item.designId, `${path}.designId`),
    variantId: string(item.variantId, `${path}.variantId`),
    quantity: integer(item.quantity, `${path}.quantity`, 1),
  };
}

export function parseBagStorage(value: unknown): BagStorage {
  const item = record(value, "bag");
  if (item.version !== 1) return fail("bag.version", "the supported version 1");
  return { version: 1, lines: array(item.lines, "bag.lines", parseBagLine) };
}

function parseValidatedBagLine(value: unknown, path: string): ValidatedBagLine {
  const item = record(value, path);
  return {
    design: parseDesign(item.design, `${path}.design`),
    drop: parseDrop(item.drop, `${path}.drop`),
    variant: parseVariant(item.variant, `${path}.variant`),
    quantity: integer(item.quantity, `${path}.quantity`, 1),
    lineTotal: parseMoney(item.lineTotal, `${path}.lineTotal`),
    changes: array(item.changes, `${path}.changes`, (change, changePath) =>
      enumeration(change, changePath, [
        "price_changed",
        "unavailable",
        "quantity_adjusted",
        "removed",
      ]),
    ),
  };
}

export function parseValidatedBag(value: unknown): ValidatedBag {
  const item = record(value, "validatedBag");
  return {
    lines: array(item.lines, "validatedBag.lines", parseValidatedBagLine),
    subtotal: parseMoney(item.subtotal, "validatedBag.subtotal"),
    validForCheckout: boolean(
      item.validForCheckout,
      "validatedBag.validForCheckout",
    ),
  };
}

export function parseCheckoutQuote(value: unknown): CheckoutQuote {
  const item = record(value, "checkoutQuote");
  const policies = record(
    item.acceptedPolicyVersions,
    "checkoutQuote.acceptedPolicyVersions",
  );
  return {
    id: string(item.id, "checkoutQuote.id"),
    expiresAt: isoDate(item.expiresAt, "checkoutQuote.expiresAt"),
    lines: array(item.lines, "checkoutQuote.lines", parseValidatedBagLine),
    subtotal: parseMoney(item.subtotal, "checkoutQuote.subtotal"),
    delivery: parseMoney(item.delivery, "checkoutQuote.delivery"),
    total: parseMoney(item.total, "checkoutQuote.total"),
    acceptedPolicyVersions: Object.fromEntries(
      Object.entries(policies).map(([key, value]) => [
        key,
        string(value, `checkoutQuote.acceptedPolicyVersions.${key}`),
      ]),
    ),
    requiresAcknowledgement: boolean(
      item.requiresAcknowledgement,
      "checkoutQuote.requiresAcknowledgement",
    ),
  };
}

export function parseCheckoutResult(value: unknown): CheckoutResult {
  const item = record(value, "checkoutResult");
  return {
    orderReference: string(
      item.orderReference,
      "checkoutResult.orderReference",
    ),
    paymentState: enumeration(
      item.paymentState,
      "checkoutResult.paymentState",
      ["pending", "failed", "confirmed"],
    ),
    redirectUrl: optionalString(item.redirectUrl, "checkoutResult.redirectUrl"),
    simulated: boolean(item.simulated, "checkoutResult.simulated"),
  };
}

export function parseOrderView(value: unknown): OrderView {
  const item = record(value, "order");
  return {
    reference: string(item.reference, "order.reference"),
    placedAt: isoDate(item.placedAt, "order.placedAt"),
    paymentState: enumeration(item.paymentState, "order.paymentState", [
      "pending",
      "paid",
      "failed",
      "refunded",
    ]),
    fulfillmentState: enumeration(
      item.fulfillmentState,
      "order.fulfillmentState",
      [
        "awaiting_production",
        "in_production",
        "quality_check",
        "dispatched",
        "delivered",
        "cancelled",
      ],
    ),
    lines: array(item.lines, "order.lines", parseValidatedBagLine),
    subtotal: parseMoney(item.subtotal, "order.subtotal"),
    delivery: parseMoney(item.delivery, "order.delivery"),
    total: parseMoney(item.total, "order.total"),
    estimatedDispatchText: string(
      item.estimatedDispatchText,
      "order.estimatedDispatchText",
    ),
    events: array(item.events, "order.events", (event, path) => {
      const entry = record(event, path);
      return {
        occurredAt: isoDate(entry.occurredAt, `${path}.occurredAt`),
        label: string(entry.label, `${path}.label`),
        detail: optionalString(entry.detail, `${path}.detail`),
      };
    }),
    simulated: boolean(item.simulated, "order.simulated"),
  };
}

export function parseSafeError(value: unknown): SafeDataError {
  const item = record(value, "error");
  const parsedFieldErrors =
    item.fieldErrors === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(record(item.fieldErrors, "error.fieldErrors")).map(
            ([key, messages]) => [
              key,
              array(messages, `error.fieldErrors.${key}`, string),
            ],
          ),
        );
  return {
    code: enumeration(item.code, "error.code", [
      "invalid_data",
      "configuration_error",
      "not_found",
      "unavailable",
      "price_changed",
      "quote_expired",
      "unauthorized",
      "rate_limited",
      "temporary_failure",
    ]),
    message: string(item.message, "error.message"),
    fieldErrors: parsedFieldErrors,
    requestId: optionalString(item.requestId, "error.requestId"),
  };
}

export const parseServiceList = (value: unknown) =>
  array(value, "services", parseService);
export const parseDropList = (value: unknown) =>
  array(value, "drops", parseDrop);
export const parseBuildUpdateList = (value: unknown) =>
  array(value, "buildUpdates", parseBuildUpdate);
