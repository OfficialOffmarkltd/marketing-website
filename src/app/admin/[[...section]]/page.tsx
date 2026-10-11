import type { Metadata } from "next";
import { getClientDataConfiguration } from "@/data/source.server";
import { AdminLoginPage, AdminPage } from "@/features/admin/admin-pages";

export const metadata: Metadata = {
  title: "Staff admin",
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  const section = (await params).section?.join("/") ?? "";
  const configuration = getClientDataConfiguration();
  return section === "login" ? (
    <AdminLoginPage configuration={configuration} />
  ) : (
    <AdminPage section={section} configuration={configuration} />
  );
}
