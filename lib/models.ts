/**
 * Curated fallback model list and cost math.
 *
 * The app normally uses the live catalog from lib/catalog.ts. This list is only
 * used when OpenRouter's models endpoint is unreachable, so the playground still
 * works offline or during an outage.
 */
import type { ModelConfig } from "@/types";

// IDs and pricing verified against https://openrouter.ai/api/v1/models
// (prices are USD per 1K tokens). Re-check periodically; OpenRouter retires models.
export const MODELS: ModelConfig[] = [
  // OpenAI
  { id: "openai/gpt-6-luna", name: "GPT-6 Luna", inputPer1k: 0.0001, outputPer1k: 0.0005 },
  { id: "openai/gpt-6.1-terra", name: "GPT-6.1 Terra", inputPer1k: 0.001, outputPer1k: 0.005 },
  { id: "openai/gpt-6.2-sol", name: "GPT-6.2 Sol", inputPer1k: 0.002, outputPer1k: 0.01 },

  // Anthropic
  { id: "anthropic/claude-haiku-5.5", name: "Claude Haiku 5.5", inputPer1k: 0.0001, outputPer1k: 0.0005 },
  { id: "anthropic/claude-sonnet-5.5", name: "Claude Sonnet 5.5", inputPer1k: 0.002, outputPer1k: 0.01 },

  // Google
  { id: "google/gemini-4-carbon", name: "Gemini 4 Carbon", inputPer1k: 0.002, outputPer1k: 0.01 },
  { id: "google/gemini-4-hydrogen", name: "Gemini 4 Hydrogen", inputPer1k: 0.0015, outputPer1k: 0.0075 },

  // Meta
  { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout", inputPer1k: 0.0001, outputPer1k: 0.0003 },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick", inputPer1k: 0.00035, outputPer1k: 0.001 },

  // Others
  { id: "deepseek/deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", inputPer1k: 0.00005, outputPer1k: 0.000199 },
  { id: "mistralai/mistral-small-2603", name: "Mistral Small 4", inputPer1k: 0.00015, outputPer1k: 0.0006 },
];

/** Looks up a model in the curated fallback list. */
export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

/**
 * Estimated USD cost of one request:
 *   (prompt tokens / 1000) x input price + (completion tokens / 1000) x output price
 * This uses list prices, so treat it as an estimate rather than a bill.
 */
export function calculateCost(
  model: ModelConfig,
  promptTokens: number,
  completionTokens: number
): number {
  const inputCost = (promptTokens / 1000) * model.inputPer1k;
  const outputCost = (completionTokens / 1000) * model.outputPer1k;
  return inputCost + outputCost;
}
