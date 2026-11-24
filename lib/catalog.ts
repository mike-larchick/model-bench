import type { ModelConfig } from "@/types";
import { MODELS as FALLBACK_MODELS } from "@/lib/models";

const MODELS_URL = "https://openrouter.ai/api/v1/models";
const TTL_MS = 60 * 60 * 1000; // 1 hour

interface OpenRouterModel {
  id: string;
  name: string;
  created?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { output_modalities?: string[] };
}

let cache: { at: number; models: ModelConfig[] } | null = null;

function toConfig(m: OpenRouterModel): ModelConfig | null {
  // Skip variants (":batch", ":free", ":thinking", ...) and non text-output models
  if (m.id.includes(":")) return null;
  const out = m.architecture?.output_modalities;
  if (out && !(out.length === 1 && out[0] === "text")) return null;

  const input = Number(m.pricing?.prompt);
  const output = Number(m.pricing?.completion);
  // Router/meta models report negative or missing pricing
  if (!Number.isFinite(input) || !Number.isFinite(output) || input < 0 || output < 0) {
    return null;
  }

  return {
    id: m.id,
    name: m.name.replace(/^[^:]+:\s*/, ""),
    inputPer1k: input * 1000,
    outputPer1k: output * 1000,
  };
}

/**
 * Live model list from OpenRouter (newest first), cached in-memory for an hour.
 * Falls back to the curated list if the API is unreachable, so the app never breaks.
 */
export async function getModelCatalog(): Promise<ModelConfig[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.models;

  try {
    const res = await fetch(MODELS_URL, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = (await res.json()) as { data: OpenRouterModel[] };

    const models = data
      .slice()
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
      .map(toConfig)
      .filter((m): m is ModelConfig => m !== null);

    if (models.length === 0) throw new Error("empty catalog");
    cache = { at: Date.now(), models };
    return models;
  } catch (err) {
    console.error("[catalog] falling back to curated models:", err);
    return cache?.models ?? FALLBACK_MODELS;
  }
}
