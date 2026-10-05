export const navigation = [
  { href: "/collections", label: "Collections" },
  { href: "/seam", label: "Seam" },
  { href: "/platform", label: "Platform" },
  { href: "/building", label: "Building" },
  { href: "/about", label: "About" },
] as const;

export function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
