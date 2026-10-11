"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef } from "react";
import { Header } from "./header";

export function SiteShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: ReactNode;
}) {
  const path = usePathname();
  const previousPath = useRef(path);
  useEffect(() => {
    if (previousPath.current !== path) {
      document.getElementById("main")?.focus();
      previousPath.current = path;
    }
  }, [path]);
  const compact =
    path === "/checkout" ||
    path === "/preview/checkout" ||
    path === "/orders" ||
    path.startsWith("/orders/") ||
    path.startsWith("/preview/orders/");
  const admin =
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/preview/admin" ||
    path.startsWith("/preview/admin/");
  if (admin) return <>{children}</>;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header key={path} compact={compact} />
      <main id="main" tabIndex={-1} className="site-main">
        {children}
      </main>
      {compact ? (
        <footer className="compact-footer site-container">
          Offmark · Collections
        </footer>
      ) : (
        footer
      )}
    </>
  );
}
