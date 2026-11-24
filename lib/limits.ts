/**
 * Request limits shared by the UI and the API.
 *
 * Every comparison spends real OpenRouter credits, so the server enforces these
 * limits in app/api/compare/route.ts. The UI imports the same constants so the
 * two can't drift apart. Client-side checks are only for usability; the server
 * check is the one that protects the credit balance.
 *
 * This file must stay free of server-only imports because client components
 * import it.
 */

/** Maximum models per comparison. Also the number of selector slots in the UI. */
export const MAX_MODELS = 3;

/** Maximum prompt length in characters (roughly 1,000 tokens). */
export const MAX_PROMPT_CHARS = 4000;
