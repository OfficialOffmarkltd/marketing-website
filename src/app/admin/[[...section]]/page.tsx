import type { Metadata } from "next";
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
  return section === "login" ? (
    <AdminLoginPage />
  ) : (
    <AdminPage section={section} />
  );
}
