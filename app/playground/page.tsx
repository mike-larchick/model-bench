"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ModelSelector from "@/components/ModelSelector";
import PromptInput from "@/components/PromptInput";
import ComparisonGrid from "@/components/ComparisonGrid";
import type { CompareResult, ModelConfig } from "@/types";

const DEFAULT_MODELS = [
  "openai/gpt-6-luna",
  "anthropic/claude-haiku-5.5",
  "meta-llama/llama-4-scout",
];

export default function PlaygroundPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedModels, setSelectedModels] = useState<string[]>(DEFAULT_MODELS);
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<ModelConfig[]>([]);

  // Load the live model catalog and drop any default that's been retired
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/models")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((list: ModelConfig[]) => {
        if (cancelled) return;
        setModels(list);
        const ids = new Set(list.map((m) => m.id));
        setSelectedModels((prev) => {
          const kept = prev.filter((id) => ids.has(id));
          const fillers = list.map((m) => m.id).filter((id) => !kept.includes(id));
          return [...kept, ...fillers].slice(0, prev.length);
        });
      })
      .catch((e) => !cancelled && setError(`Could not load models: ${e.message}`));
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-zinc-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleModelChange = (index: number, value: string) => {
    setSelectedModels((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addModel = () => {
    if (selectedModels.length < 3) {
      const next =
        models.find((m) => !selectedModels.includes(m.id))?.id ??
        "deepseek/deepseek-v4.1-flash";
      setSelectedModels((prev) => [...prev, next]);
    }
  };

  const removeModel = (index: number) => {
    if (selectedModels.length > 1) {
      setSelectedModels((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleCompare = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), models: selectedModels }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const data: CompareResult[] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-zinc-50">Model Bench</span>
            <span className="rounded-full bg-indigo-900/40 px-2 py-0.5 text-xs text-indigo-300">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? "User"}
                className="h-7 w-7 rounded-full"
              />
            )}
            <span className="hidden text-sm text-zinc-400 sm:block">
              {session.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-8">
          {/* Config panel */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-6">
            {/* Model selectors */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-300">Models</h2>
                {selectedModels.length < 3 && (
                  <button
                    onClick={addModel}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                  >
                    <span>+ Add model</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {selectedModels.map((modelId, i) => (
                  <div key={i} className="flex items-end gap-2 flex-1 min-w-[200px]">
                    <div className="flex-1">
                      <ModelSelector
                        label={`Model ${i + 1}`}
                        value={modelId}
                        models={models}
                        onChange={(v) => handleModelChange(i, v)}
                      />
                    </div>
                    {selectedModels.length > 1 && (
                      <button
                        onClick={() => removeModel(i)}
                        className="mb-0.5 rounded-lg border border-zinc-700 p-2 text-zinc-500 hover:text-red-400 hover:border-red-800 transition"
                        title="Remove model"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleCompare}
              loading={loading}
            />
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Results */}
          {(loading || results.length > 0) && (
            <section>
              <h2 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-widest">
                Results
              </h2>
              <ComparisonGrid
                selectedModels={selectedModels}
                models={models}
                results={results}
                loading={loading}
              />
            </section>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-zinc-800 p-4">
                <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.75 3.75a.75.75 0 00-1.5 0v.75H6a2.25 2.25 0 00-2.25 2.25v12A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25v-12A2.25 2.25 0 0018 3.75h-2.25V3a.75.75 0 00-1.5 0v.75h-4.5V3z" />
                </svg>
              </div>
              <p className="text-zinc-500 text-sm">
                Select models, enter a prompt, and hit <strong className="text-zinc-400">Compare →</strong>
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-600">
        Model Bench · Built with Next.js & OpenRouter
      </footer>
    </div>
  );
}
