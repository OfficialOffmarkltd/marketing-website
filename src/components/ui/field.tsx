"use client";

import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/utils";

export function Field({ label, helper, error, id, className, "aria-describedby": describedBy, ...props }: ComponentProps<"input"> & { label: string; helper?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptions = [describedBy, helper && `${inputId}-helper`, error && `${inputId}-error`].filter(Boolean).join(" ");
  return <div className={cn("field", className)}>
    <label htmlFor={inputId} className="text-label">{label}{props.required && <span aria-hidden="true"> *</span>}</label>
    <input {...props} id={inputId} className="field-input" aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={descriptions || undefined} />
    {helper && <p id={`${inputId}-helper`} className="field-helper">{helper}</p>}
    {error && <p id={`${inputId}-error`} className="field-error">{error}</p>}
  </div>;
}
