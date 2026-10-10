import type { Metadata } from "next";
import { getServerDataSource } from "@/data/source.server";
import { loadBagCatalogue } from "@/features/bag/data";
import { CheckoutPage } from "@/features/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function Page() {
  return (
    <CheckoutPage catalogue={await loadBagCatalogue(getServerDataSource())} />
  );
}
