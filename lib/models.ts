import type { ModelConfig } from "@/types";

export const MODELS: ModelConfig[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    inputPer1k: 0.005,
    outputPer1k: 0.015,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    inputPer1k: 0.00015,
    outputPer1k: 0.0006,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    inputPer1k: 0.003,
    outputPer1k: 0.015,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    inputPer1k: 0.00025,
    outputPer1k: 0.00125,
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B",
    inputPer1k: 0.0009,
    outputPer1k: 0.0009,
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    inputPer1k: 0.000075,
    outputPer1k: 0.0003,
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function calculateCost(
  model: ModelConfig,
  promptTokens: number,
  completionTokens: number
): number {
  const inputCost = (promptTokens / 1000) * model.inputPer1k;
  const outputCost = (completionTokens / 1000) * model.outputPer1k;
  return inputCost + outputCost;
}
