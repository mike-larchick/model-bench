/**
 * Live model catalog from OpenRouter.
 *
 * OpenRouter retires and adds models often, so hardcoded IDs go stale (this app
 * hit that in practice: several 404s from retired models). The catalog is
 * fetched from OpenRouter's public models endpoint (no API key needed), cached
 * in memory, and falls back to the curated list if the fetch fails.
 *
 * Server-only. The browser reads it through GET /api/models.
 */
import type { ModelConfig } from "@/types";
import { MODELS as FALLBACK_MODELS } from "@/lib/models";

const MODELS_URL = "https://openrouter.ai/api/v1/models";
const TTL_MS = 60 * 60 * 1000; // refresh at most once per hour

/** The subset of OpenRouter's model object that this app uses. */
interface OpenRouterModel {
  id: string;
  name: string;
  /** Unix timestamp the model was added. Used to sort newest first. */
  created?: number;
  /** Prices are USD per single token, as decimal strings. */
  pricing?: { prompt?: string; completion?: string };
  architecture?: { output_modalities?: string[] };
}

/**
 * Per-instance in-memory cache. On a serverless platform each warm instance
 * keeps its own copy, which is fine here because the data is public and cheap
 * to refetch.
 */
let cache: { at: number; models: ModelConfig[] } | null = null;

/**
 * Converts an OpenRouter model into our ModelConfig, or returns null if the
 * model isn't suitable for a text-comparison UI.
 */
function toConfig(m: OpenRouterModel): ModelConfig | null {
  // Skip variants (":batch", ":free", ":thinking", ...). They duplicate a base
  // model with different pricing or behavior and clutter the dropdown.
  if (m.id.includes(":")) return null;

  // Keep text-only output. Skip image/audio/video generation models.
  const out = m.architecture?.output_modalities;
  if (out && !(out.length === 1 && out[0] === "text")) return null;

  const input = Number(m.pricing?.prompt);
  const output = Number(m.pricing?.completion);
  // Router/meta models report negative or missing pricing, so they can't be costed.
  if (!Number.isFinite(input) || !Number.isFinite(output) || input < 0 || output < 0) {
    return null;
  }

  return {
    id: m.id,
    // OpenRouter names look like "OpenAI: GPT-6 Luna". The provider already
    // groups the dropdown, so drop the prefix.
    name: m.name.replace(/^[^:]+:\s*/, ""),
    // OpenRouter prices are per token. The app uses per 1K tokens.
    inputPer1k: input * 1000,
    outputPer1k: output * 1000,
  };
}

/**
 * Returns the live model list (newest first), cached for an hour.
 *
 * Falls back to the last good cache, then to the curated list, so a failed
 * fetch never breaks the app. Callers always get a non-empty array.
 */
export async function getModelCatalog(): Promise<ModelConfig[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.models;

  try {
    // Timeout so a slow upstream can't hang the playground load.
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
    // Prefer stale-but-real data over the hand-maintained fallback.
    return cache?.models ?? FALLBACK_MODELS;
  }
}
