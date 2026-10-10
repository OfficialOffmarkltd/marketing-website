import { notFound } from "next/navigation";
import { OrderAccessPage } from "@/features/orders/order-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <OrderAccessPage
      demo
      scenario={
        (await searchParams).scenario === "rate_limited"
          ? "rate_limited"
          : "success"
      }
    />
  );
}
