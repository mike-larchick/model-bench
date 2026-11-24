"use client";

import type { CompareResult } from "@/types";

interface ResponseCardProps {
  result?: CompareResult;
  loading?: boolean;
  modelName?: string;
}

function SkeletonCard({ modelName }: { modelName?: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-zinc-900 p-5 animate-pulse">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-300">
          {modelName ?? "Loading…"}
        </span>
        <span className="rounded-full bg-zinc-700 h-5 w-16" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-5/6" />
        <div className="h-3 bg-zinc-700 rounded w-4/6" />
        <div className="h-3 bg-zinc-700 rounded w-3/6" />
      </div>
      <div className="mt-auto flex gap-4">
        <div className="h-3 bg-zinc-700 rounded w-20" />
        <div className="h-3 bg-zinc-700 rounded w-16" />
        <div className="h-3 bg-zinc-700 rounded w-14" />
      </div>
    </div>
  );
}

export default function ResponseCard({
  result,
  loading,
  modelName,
}: ResponseCardProps) {
  if (loading) {
    return <SkeletonCard modelName={modelName} />;
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center min-h-[200px]">
        <svg
          className="h-8 w-8 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 3v-3z"
          />
        </svg>
        <p className="text-sm text-zinc-500">Response will appear here</p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-red-800 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-300">
            {result.modelName}
          </span>
          <span className="rounded-full bg-red-900/50 px-2 py-0.5 text-xs text-red-400">
            Error
          </span>
        </div>
        <p className="text-sm text-red-400">{result.error}</p>
      </div>
    );
  }

  const costDisplay =
    result.estimatedCost < 0.001
      ? `$${(result.estimatedCost * 1000).toFixed(4)}m`
      : `$${result.estimatedCost.toFixed(5)}`;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-zinc-900 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-100">
          {result.modelName}
        </span>
        <span className="rounded-full bg-indigo-900/40 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
          {result.latencyMs.toLocaleString()} ms
        </span>
      </div>

      {/* Response content */}
      <div className="flex-1 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
        {result.content || <span className="text-zinc-500 italic">No content returned.</span>}
      </div>

      {/* Stats footer */}
      <div className="mt-auto flex flex-wrap gap-4 border-t border-zinc-800 pt-3">
        <Stat
          label="Tokens"
          value={result.usage.total_tokens.toLocaleString()}
        />
        <Stat
          label="Prompt"
          value={result.usage.prompt_tokens.toLocaleString()}
        />
        <Stat
          label="Completion"
          value={result.usage.completion_tokens.toLocaleString()}
        />
        <Stat label="Est. Cost" value={costDisplay} highlight />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-zinc-500">{label}</span>
      <span
        className={`text-xs font-semibold ${
          highlight ? "text-emerald-400" : "text-zinc-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
