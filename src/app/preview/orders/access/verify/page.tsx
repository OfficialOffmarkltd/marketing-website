import { notFound } from "next/navigation";
import { OrderAccessVerifyPage } from "@/features/orders/order-pages";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; scenario?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const values = await searchParams;
  return (
    <OrderAccessVerifyPage
      token={values.token}
      demo
      scenario={
        values.scenario === "access_expired" ? "access_expired" : "success"
      }
    />
  );
}
