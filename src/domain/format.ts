import type { Money } from "./catalog";

const ngnFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  currencyDisplay: "symbol",
});

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Africa/Lagos",
});

export function formatMoney(money: Money) {
  return ngnFormatter.format(money.amountMinor / 100);
}

export function formatPublishedDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.valueOf()))
    throw new TypeError("Invalid publication date");
  return dateFormatter.format(date);
}

export function isSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
