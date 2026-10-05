"use client";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const DialogRoot = Dialog.Root;
export const DialogTrigger = Dialog.Trigger;
export const DialogClose = Dialog.Close;
export function DialogContent({ title, description, children, sheet = false, ...props }: Omit<Dialog.Popup.Props, "children" | "className"> & { title: string; description?: string; children: ReactNode; sheet?: boolean }) {
  return <Dialog.Portal><Dialog.Backdrop className="dialog-backdrop" /><Dialog.Popup {...props} data-theme="light" className={cn("dialog-popup", sheet && "dialog-sheet")}>
    <div className="dialog-heading"><Dialog.Title className="heading-card">{title}</Dialog.Title><Dialog.Close className="button button-secondary button-icon" aria-label={`Close ${title.toLowerCase()}`}><XIcon size={24} aria-hidden="true" /></Dialog.Close></div>
    {description && <Dialog.Description className="muted-copy">{description}</Dialog.Description>}
    {children}
  </Dialog.Popup></Dialog.Portal>;
}
