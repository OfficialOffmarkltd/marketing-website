import type { Metadata } from "next";
import { OrderAccessPage } from "@/features/orders/order-pages";

export const metadata: Metadata = {
  title: "Access your order",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <OrderAccessPage />;
}
