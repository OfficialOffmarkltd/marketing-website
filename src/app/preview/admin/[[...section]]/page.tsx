import { notFound } from "next/navigation";
import { AdminLoginPage, AdminPage } from "@/features/admin/admin-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const section = (await params).section?.join("/") ?? "";
  const configuration = { mode: "demo", scenario: "success" } as const;
  return section === "login" ? (
    <AdminLoginPage configuration={configuration} />
  ) : (
    <AdminPage section={section} configuration={configuration} />
  );
}
