/**
 * POST /api/compare
 *
 * Sends one prompt to several models in parallel and returns one result per
 * model (response text, latency, token usage, estimated cost).
 *
 * Request body:  { prompt: string, models: string[] }   // OpenRouter model IDs
 * Response body: CompareResult[]
 *
 * Limits (see lib/limits.ts): at most MAX_MODELS models, a prompt of at most
 * MAX_PROMPT_CHARS characters, and only model IDs that exist in the live
 * catalog. Duplicate IDs are collapsed. Violations return a 400.
 *
 * A failure for one model (bad ID, out of credits, provider error) does not
 * fail the request. That model's entry carries an `error` string and the others
 * still return normally. See lib/openrouter.ts.
 *
 * The OpenRouter API key never leaves the server: the browser calls this route,
 * and this route calls OpenRouter. Requires a signed-in user.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryModel } from "@/lib/openrouter";
import { getModelCatalog } from "@/lib/catalog";
import { MAX_MODELS, MAX_PROMPT_CHARS } from "@/lib/limits";
import type { CompareRequest } from "@/types";

export async function POST(req: NextRequest) {
  // Every request that spends OpenRouter credits must come from a signed-in user.
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CompareRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, models } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  // Cap prompt size. The UI enforces the same limit, but this check is the one
  // that protects the credit balance, because anyone can call the API directly.
  if (prompt.trim().length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `prompt must be ${MAX_PROMPT_CHARS.toLocaleString()} characters or fewer` },
      { status: 400 }
    );
  }

  if (!Array.isArray(models) || models.length === 0) {
    return NextResponse.json(
      { error: "models array is required" },
      { status: 400 }
    );
  }

  // Cap the fan-out. Each model is a separate billed request.
  if (models.length > MAX_MODELS) {
    return NextResponse.json(
      { error: `compare at most ${MAX_MODELS} models at a time` },
      { status: 400 }
    );
  }

  // Look up live pricing by model ID so cost estimates use current prices.
  const catalog = await getModelCatalog();
  const byId = new Map(catalog.map((m) => [m.id, m]));

  // Only accept IDs from the catalog. This rejects malformed input and keeps
  // callers from sending arbitrary strings (or non-strings) to OpenRouter.
  const unknown = models.filter((m) => typeof m !== "string" || !byId.has(m));
  if (unknown.length > 0) {
    return NextResponse.json(
      { error: `unknown model: ${String(unknown[0])}` },
      { status: 400 }
    );
  }

  // De-duplicate so the same model can't be billed twice in one request.
  const uniqueModels = [...new Set(models)];

  // Fire all requests at once. Total wait is roughly the slowest model,
  // not the sum of all of them.
  const results = await Promise.all(
    uniqueModels.map((model) => queryModel(model, prompt.trim(), byId.get(model)))
  );

  return NextResponse.json(results);
}
