import { notFound } from "next/navigation";
import { AdminLoginPage, AdminPage } from "@/features/admin/admin-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const section = (await params).section?.join("/") ?? "";
  return section === "login" ? (
    <AdminLoginPage demo />
  ) : (
    <AdminPage section={section} demo />
  );
}
