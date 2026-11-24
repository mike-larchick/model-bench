import type { CompareResult, ModelUsage } from "@/types";
import { getModelById, calculateCost } from "@/lib/models";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function queryModel(
  model: string,
  prompt: string
): Promise<CompareResult> {
  const modelConfig = getModelById(model);
  const modelName = modelConfig?.name ?? model;

  const start = Date.now();

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Model Bench",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const latencyMs = Date.now() - start;

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

    const estimatedCost = modelConfig
      ? calculateCost(modelConfig, usage.prompt_tokens, usage.completion_tokens)
      : 0;

    return { model, modelName, content, latencyMs, usage, estimatedCost };
  } catch (err) {
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
