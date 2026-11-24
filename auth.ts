/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Authentication is GitHub OAuth only. Sessions are stateless JWTs stored in a
 * cookie, so no database is needed.
 *
 * Required environment variables:
 *   AUTH_SECRET         - signs/encrypts the session cookie (`openssl rand -base64 32`)
 *   AUTH_GITHUB_ID      - client ID of the GitHub OAuth app
 *   AUTH_GITHUB_SECRET  - client secret of the GitHub OAuth app
 *   AUTH_TRUST_HOST     - set to "true" when deployed behind Vercel's proxy
 *
 * The OAuth app's callback URL must exactly match
 *   <site-origin>/api/auth/callback/github
 * otherwise GitHub rejects sign-in with "redirect_uri is not associated with
 * this application". Use separate OAuth apps for localhost and production.
 *
 * Exports:
 *   handlers - GET/POST route handlers, mounted in app/api/auth/[...nextauth]
 *   auth     - reads the current session (server components, route handlers, proxy)
 *   signIn / signOut - server-side helpers used by form actions
 */
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  pages: {
    // Use the landing page as the sign-in screen instead of Auth.js's default page.
    signIn: "/",
  },
});
