/**
 * OpenRouter client: runs a single prompt against a single model.
 *
 * Server-only. It reads OPENROUTER_API_KEY, which must never reach the browser.
 */
import type { CompareResult, ModelConfig, ModelUsage } from "@/types";
import { getModelById, calculateCost } from "@/lib/models";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Upper bound on generated tokens per response. Without it OpenRouter reserves
 * the model's full output limit (often 16K+) against the account balance, which
 * fails with a 402 on small credit balances. It also bounds the cost of any
 * single comparison.
 */
const MAX_TOKENS = 1024;

/**
 * Sends `prompt` to `model` and measures latency, token usage and cost.
 *
 * Never throws. Network failures and non-2xx responses are returned as a
 * CompareResult with `error` set, so one bad model can't break a multi-model
 * comparison.
 *
 * @param model  OpenRouter model ID, e.g. "openai/gpt-6-luna"
 * @param prompt User prompt, sent as a single user message
 * @param config Live pricing for this model. Falls back to the curated list.
 */
export async function queryModel(
  model: string,
  prompt: string,
  config?: ModelConfig
): Promise<CompareResult> {
  const modelConfig = config ?? getModelById(model);
  const modelName = modelConfig?.name ?? model;

  // Latency covers the full round trip (request sent -> response headers + body).
  const start = Date.now();

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        // Optional headers OpenRouter uses to attribute traffic to this app.
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Model Bench",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: MAX_TOKENS,
      }),
    });

    const latencyMs = Date.now() - start;

    // Surface OpenRouter's error body (e.g. 402 out of credits, 404 retired model).
    if (!res.ok) {
      const errText = await res.text();
      return {
        model,
        modelName,
        content: "",
        latencyMs,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        estimatedCost: 0,
        error: `API error ${res.status}: ${errText}`,
      };
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content ?? "";
    const usage: ModelUsage = data.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    // Cost is an estimate: token counts from the response x catalog list prices.
    const estimatedCost = modelConfig
      ? calculateCost(modelConfig, usage.prompt_tokens, usage.completion_tokens)
      : 0;

    return { model, modelName, content, latencyMs, usage, estimatedCost };
  } catch (err) {
    // Network-level failure (DNS, timeout, connection reset, ...).
    return {
      model,
      modelName,
      content: "",
      latencyMs: Date.now() - start,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      estimatedCost: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
