export interface ModelConfig {
  id: string;
  name: string;
  inputPer1k: number;
  outputPer1k: number;
}

export interface CompareRequest {
  prompt: string;
  models: string[];
}

export interface ModelUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CompareResult {
  model: string;
  modelName: string;
  content: string;
  latencyMs: number;
  usage: ModelUsage;
  estimatedCost: number;
  error?: string;
}
