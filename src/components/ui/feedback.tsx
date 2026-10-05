import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}
export function Alert({ title, children, tone = "info" }: { title: string; children: ReactNode; tone?: "info" | "error" | "success" }) {
  return <div className={cn("alert", `alert-${tone}`)} role={tone === "error" ? "alert" : "status"}><p className="text-label">{title}</p><div>{children}</div></div>;
}
export function EmptyState({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <div className="empty-state"><h2 className="text-section">{title}</h2><div className="measure muted-copy">{children}</div>{action}</div>;
}
export function LoadingState({ label = "Loading page…" }: { label?: string }) {
  return <div className="loading-state" role="status"><span className="loading-dot" aria-hidden="true" />{label}</div>;
}
