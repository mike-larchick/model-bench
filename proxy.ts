/**
 * Route protection.
 *
 * Next.js 16 renamed `middleware.ts` to `proxy.ts`. Auth.js's `auth` function can
 * be used directly as the proxy: it checks the session cookie and, for requests
 * without a valid session, redirects to the sign-in page configured in auth.ts.
 *
 * This is the first line of defense for the UI. The API routes under
 * app/api/* also verify the session themselves, so they stay protected even if
 * this matcher is changed or bypassed.
 */
import { auth } from "@/auth";

export const proxy = auth;

export const config = {
  // Only the playground requires a signed-in user. The landing page and the
  // Auth.js endpoints (/api/auth/*) must stay public.
  matcher: ["/playground/:path*"],
};
