/**
 * Auth.js catch-all route. Serves every /api/auth/* endpoint
 * (sign-in, OAuth callback, session, sign-out, CSRF token).
 * All behavior is configured in auth.ts.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
