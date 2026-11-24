"use client";

import ResponseCard from "./ResponseCard";
import type { CompareResult } from "@/types";
import { MODELS } from "@/lib/models";

interface ComparisonGridProps {
  selectedModels: string[];
  results: CompareResult[];
  loading: boolean;
}

export default function ComparisonGrid({
  selectedModels,
  results,
  loading,
}: ComparisonGridProps) {
  const getResult = (modelId: string) =>
    results.find((r) => r.model === modelId);

  const getModelName = (modelId: string) =>
    MODELS.find((m) => m.id === modelId)?.name ?? modelId;

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
