"use client";

/**
 * Prompt textarea and submit button. Submits on click or Cmd/Ctrl+Enter.
 * Fully controlled: the parent owns the text and the loading state.
 */
import { MAX_PROMPT_CHARS } from "@/lib/limits";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when the user submits. The parent decides whether to proceed. */
  onSubmit: () => void;
  /** True while a comparison is running. Disables input and shows a spinner. */
  loading: boolean;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  loading,
}: PromptInputProps) {
  // Plain Enter inserts a newline. Cmd/Ctrl+Enter submits, matching common chat UIs.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!loading && value.trim()) onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        Prompt
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a prompt to compare across models… (⌘+Enter to submit)"
        rows={4}
        // Mirrors the server-side cap in /api/compare so users can't type past it.
        maxLength={MAX_PROMPT_CHARS}
        disabled={loading}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition"
      />
      {/* Character counter so the limit isn't a surprise. */}
      <p className="self-end text-xs text-zinc-500">
        {value.length.toLocaleString()} / {MAX_PROMPT_CHARS.toLocaleString()}
      </p>
      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="self-end rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Comparing…
          </span>
        ) : (
          "Compare →"
        )}
      </button>
    </div>
  );
}
