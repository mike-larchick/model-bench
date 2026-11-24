/**
 * GET /api/models
 *
 * Returns the model catalog that populates the playground dropdowns:
 * ModelConfig[] with id, display name, and per-1K-token prices.
 *
 * The list comes from OpenRouter's public models endpoint (cached for an hour
 * in lib/catalog.ts), so retired models disappear and new ones appear without
 * a code change. Requires a signed-in user.
 */
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getModelCatalog } from "@/lib/catalog";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getModelCatalog());
}
