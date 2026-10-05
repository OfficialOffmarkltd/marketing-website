import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("site-container", className)} />;
}
export function Section({
  className,
  theme = "light",
  ...props
}: ComponentProps<"section"> & { theme?: "light" | "orange" | "dark" }) {
  return (
    <section
      {...props}
      data-theme={theme}
      className={cn("section", className)}
    />
  );
}
export function PageHeading({
  eyebrow,
  children,
  lead,
}: {
  eyebrow?: string;
  children: ReactNode;
  lead?: string;
}) {
  return (
    <div className="page-heading">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="text-page">{children}</h1>
      {lead && <p className="text-lead measure muted-copy">{lead}</p>}
    </div>
  );
}
