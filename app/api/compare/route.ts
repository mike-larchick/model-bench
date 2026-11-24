import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { queryModel } from "@/lib/openrouter";
import { getModelCatalog } from "@/lib/catalog";
import type { CompareRequest } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CompareRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, models } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  if (!Array.isArray(models) || models.length === 0) {
    return NextResponse.json(
      { error: "models array is required" },
      { status: 400 }
    );
  }

  const catalog = await getModelCatalog();
  const byId = new Map(catalog.map((m) => [m.id, m]));

  const results = await Promise.all(
    models.map((model) => queryModel(model, prompt.trim(), byId.get(model)))
  );

  return NextResponse.json(results);
}
