import { notFound } from "next/navigation";
import { AboutPage } from "@/features/company/company-pages";

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AboutPage />;
}
