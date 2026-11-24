/**
 * Landing page and sign-in screen (server component).
 *
 * Signed-in users are redirected straight to the playground. Everyone else sees
 * the pitch and a "Sign in with GitHub" button.
 */
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { connection } from "next/server";

export default async function LandingPage() {
  // Opt out of static prerendering. This page depends on the per-request
  // session cookie, so it must render at request time.
  await connection();
  const session = await auth();
  if (session) {
    redirect("/playground");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-zinc-950">
      {/* Background gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-8 text-center max-w-xl">
        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-700/50 bg-indigo-900/20 px-3 py-1 text-xs font-medium text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Powered by OpenRouter
        </span>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-50 sm:text-6xl">
            Model Bench
          </h1>
          <p className="text-lg text-zinc-400">
            Compare AI models side by side, powered by OpenRouter.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "GPT-6",
            "Claude 5.5",
            "Llama 4",
            "Gemini 4",
          ].map((m) => (
            <span
              key={m}
              className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
            >
              {m}
            </span>
          ))}
          <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
            + more
          </span>
        </div>

        {/* Sign-in form. A server action starts the GitHub OAuth flow, so no
            client JavaScript is needed and the form works as a plain POST. */}
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/playground" });
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-3 rounded-xl bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition border border-zinc-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.26.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.807 5.625-5.479 5.92.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.796 24 17.298 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>
        </form>

        <p className="text-xs text-zinc-600">
          Sign in to access the comparison playground.
        </p>
      </div>
    </main>
  );
}
