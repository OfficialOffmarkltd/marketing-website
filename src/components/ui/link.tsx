import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function ActionLink({ className, variant = "primary", ...props }: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" | "dark" | "text" }) {
  return <Link {...props} className={cn("button", variant === "text" ? "button-link" : `button-${variant}`, className)} />;
}
