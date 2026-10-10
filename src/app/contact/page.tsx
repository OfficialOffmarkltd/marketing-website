import type { Metadata } from "next";
import { ContactPage } from "@/features/company/company-pages";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Offmark about company, product and collaboration enquiries.",
};

export default function Page() {
  return <ContactPage />;
}
