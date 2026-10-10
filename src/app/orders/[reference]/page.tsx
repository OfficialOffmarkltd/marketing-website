import type { Metadata } from "next";
import { OrderPage } from "@/features/orders/order-pages";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  return <OrderPage reference={(await params).reference} />;
}
