"use client";

import { Button as Primitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("button", {
  variants: {
    variant: { default: "button-primary", outline: "button-secondary", dark: "button-dark", link: "button-link" },
    size: { default: "", compact: "button-compact", icon: "button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});

export function Button({ className, variant, size, loading = false, children, disabled, ...props }: Omit<ComponentProps<typeof Primitive>, "className"> & VariantProps<typeof buttonVariants> & { className?: string; loading?: boolean }) {
  return <Primitive {...props} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} aria-busy={loading || undefined}>{loading && <span aria-hidden="true" className="loading-dot" />}{children}</Primitive>;
}
