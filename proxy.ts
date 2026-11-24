import { auth } from "@/auth";

// Re-export auth as proxy for Next.js 16 route protection
export const proxy = auth;

export const config = {
  matcher: ["/playground/:path*"],
};
