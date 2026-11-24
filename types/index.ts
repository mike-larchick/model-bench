/** A model the user can pick, with its pricing. Prices are USD per 1,000 tokens. */
export interface ModelConfig {
  /** OpenRouter model ID, e.g. "anthropic/claude-haiku-5.5". */
  id: string;
  /** Human-friendly name shown in the UI. */
  name: string;
  /** Price per 1K prompt (input) tokens, in USD. */
  inputPer1k: number;
  /** Price per 1K completion (output) tokens, in USD. */
  outputPer1k: number;
}

/** Request body for POST /api/compare. */
export interface CompareRequest {
  prompt: string;
  /** OpenRouter model IDs to run the prompt against. */
  models: string[];
}

/** Token counts reported by OpenRouter for a single completion. */
export interface ModelUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/** One model's outcome. Always present for every requested model. */
export interface CompareResult {
  /** OpenRouter model ID this result belongs to. */
  model: string;
  /** Display name (falls back to the ID if the model isn't in the catalog). */
  modelName: string;
  /** The model's reply. Empty string when `error` is set. */
  content: string;
  /** Wall-clock time of the request in milliseconds. */
  latencyMs: number;
  usage: ModelUsage;
  /** Estimated cost in USD, computed from token usage and catalog pricing. */
  estimatedCost: number;
  /** Set when the request failed. The UI shows this instead of `content`. */
  error?: string;
}
