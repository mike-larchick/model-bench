"use client";

import ResponseCard from "./ResponseCard";
/**
 * Lays out one ResponseCard per selected model, side by side.
 * One column on mobile, scaling up to three on large screens.
 */
import type { CompareResult, ModelConfig } from "@/types";

interface ComparisonGridProps {
  /** Model IDs in selector order. Determines card order. */
  selectedModels: string[];
  /** Catalog used to turn IDs into display names. */
  models: ModelConfig[];
  /** Results from /api/compare. Empty until a comparison completes. */
  results: CompareResult[];
  /** While true, every card renders its loading skeleton. */
  loading: boolean;
}

export default function ComparisonGrid({
  selectedModels,
  models,
  results,
  loading,
}: ComparisonGridProps) {
  // Match by model ID rather than array position. The API returns results in
  // request order, but matching by ID stays correct if the selection changes.
  const getResult = (modelId: string) =>
    results.find((r) => r.model === modelId);

  // Fall back to the raw ID if the model isn't in the catalog.
  const getModelName = (modelId: string) =>
    models.find((m) => m.id === modelId)?.name ?? modelId;

  // Column count follows the number of models so cards fill the row.
  const cols =
    selectedModels.length === 1
      ? "grid-cols-1"
      : selectedModels.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-4 ${cols}`}>
      {selectedModels.map((modelId) => (
        <ResponseCard
          key={modelId}
          result={getResult(modelId)}
          loading={loading}
          modelName={getModelName(modelId)}
        />
      ))}
    </div>
  );
}
