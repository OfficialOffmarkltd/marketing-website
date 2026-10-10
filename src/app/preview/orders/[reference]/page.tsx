import { notFound } from "next/navigation";
import { isDemoScenario } from "@/data/demo/scenarios";
import { OrderPage } from "@/features/orders/order-pages";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const requested = (await searchParams).scenario ?? "success";
  return (
    <OrderPage
      reference={(await params).reference}
      demo
      scenario={isDemoScenario(requested) ? requested : "success"}
    />
  );
}
