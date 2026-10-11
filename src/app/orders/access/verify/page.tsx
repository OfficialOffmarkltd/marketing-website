import type { Metadata } from "next";
import { getClientDataConfiguration } from "@/data/source.server";
import { OrderAccessVerifyPage } from "@/features/orders/order-pages";

export const metadata: Metadata = {
  title: "Verify order access",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <OrderAccessVerifyPage
      token={(await searchParams).token}
      configuration={getClientDataConfiguration()}
    />
  );
}
