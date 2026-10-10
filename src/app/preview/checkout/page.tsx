import { notFound } from "next/navigation";
import { isDemoScenario } from "@/data/demo/scenarios";
import { DemoDataSource } from "@/data/demo/source";
import { loadBagCatalogue } from "@/features/bag/data";
import { CheckoutPage } from "@/features/checkout/checkout-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const requested = (await searchParams).scenario ?? "success";
  const scenario = isDemoScenario(requested) ? requested : "success";
  return (
    <CheckoutPage
      catalogue={await loadBagCatalogue(new DemoDataSource("success"))}
      demo
      scenario={scenario}
    />
  );
}
