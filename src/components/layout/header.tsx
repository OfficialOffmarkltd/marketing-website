"use client";

import { ListIcon, ShoppingBagIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DialogContent,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionLink } from "@/components/ui/link";
import { isCurrentPath, navigation } from "@/config/navigation";
import { useBag } from "@/features/bag/bag-context";
import { Brand } from "./brand";

export function BagLink({
  count,
  href,
}: {
  count: number | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bag-link"
      aria-label={
        count === null
          ? "Bag, count unavailable"
          : `Bag, ${count} ${count === 1 ? "item" : "items"}`
      }
    >
      <ShoppingBagIcon size={24} aria-hidden="true" />
      <span aria-hidden="true">{count ?? "—"}</span>
    </Link>
  );
}
export function Header({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { count } = useBag();
  const [open, setOpen] = useState(false);
  const navigating = useRef(false);
  const shopping = ["/collections", "/bag", "/checkout", "/orders"].some(
    (path) => isCurrentPath(pathname, path),
  );
  const bagHref = pathname.startsWith("/preview/") ? "/preview/bag" : "/bag";
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <header className="site-header">
      <div className="site-container header-inner">
        <Brand />
        {compact ? (
          <ActionLink href={bagHref} variant="text">
            Back to bag
          </ActionLink>
        ) : (
          <>
            <nav className="desktop-nav" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isCurrentPath(pathname, item.href) ? "page" : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <BagLink count={count} href={bagHref} />
              <div className="desktop-cta">
                {!shopping && (
                  <ActionLink href="/collections">
                    Explore collections
                  </ActionLink>
                )}
              </div>
              <DialogRoot
                open={open}
                onOpenChange={setOpen}
                onOpenChangeComplete={(isOpen) => {
                  if (!isOpen && navigating.current) {
                    navigating.current = false;
                    document.getElementById("main")?.focus();
                  }
                }}
              >
                <DialogTrigger
                  className="button button-secondary button-icon mobile-menu-trigger"
                  aria-label="Open menu"
                  onClick={() => {
                    navigating.current = false;
                  }}
                >
                  <ListIcon size={24} aria-hidden="true" />
                </DialogTrigger>
                <DialogContent
                  title="Menu"
                  description="Explore Offmark."
                  sheet
                  finalFocus={() => !navigating.current}
                >
                  <nav className="mobile-nav" aria-label="Mobile navigation">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={
                          isCurrentPath(pathname, item.href)
                            ? "page"
                            : undefined
                        }
                        onClick={() => {
                          navigating.current = true;
                          setOpen(false);
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </DialogContent>
              </DialogRoot>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
