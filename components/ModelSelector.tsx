"use client";

import { MODELS } from "@/lib/models";

interface ModelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function ModelSelector({
  value,
  onChange,
  label,
}: ModelSelectorProps) {
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
        {MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
