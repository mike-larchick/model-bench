"use client";

/**
 * Dropdown for choosing one model. Options are grouped by provider and show
 * input/output pricing per 1M tokens so cost is visible before running.
 */
import type { ModelConfig } from "@/types";

interface ModelSelectorProps {
  /** Currently selected OpenRouter model ID. */
  value: string;
  onChange: (value: string) => void;
  label: string;
  /** Full catalog to choose from. */
  models: ModelConfig[];
}

/** Formats prices as "$input/$output per 1M". Catalog prices are per 1K tokens. */
function formatPrice(m: ModelConfig) {
  const fmt = (n: number) => `$${(n * 1000).toFixed(2)}`;
  return `${fmt(m.inputPer1k)}/${fmt(m.outputPer1k)} per 1M`;
}

export default function ModelSelector({
  value,
  onChange,
  label,
  models,
}: ModelSelectorProps) {
  // Group by provider (the part of the id before "/"), keeping newest-first order
  const groups = new Map<string, ModelConfig[]>();
  for (const m of models) {
    const provider = m.id.split("/")[0];
    groups.set(provider, [...(groups.get(provider) ?? []), m]);
  }

  // The catalog loads asynchronously. Until it arrives, or if the selected ID
  // has been retired, render the raw ID as an extra option so the <select>
  // always has a valid value to show.
  const known = models.some((m) => m.id === value);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      >
        {!known && <option value={value}>{value}</option>}
        {[...groups.entries()].map(([provider, list]) => (
          <optgroup key={provider} label={provider}>
            {list.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} — {formatPrice(model)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
