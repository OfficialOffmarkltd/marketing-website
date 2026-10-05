import { NextResponse } from "next/server";

// Component review tools are available only in local development.
// Reject before streaming so production returns an actual HTTP 404.
export function proxy() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: "/preview/:path*" };
