// Client-only loader for the public latest snapshot
// Ensures no caching and simple status mapping without throwing

import type { PublicSnapshot } from "@/lib/publisher";

export type LatestResult =
  | { status: "empty" }
  | { status: "ok"; snapshot: PublicSnapshot };

export async function fetchLatest(): Promise<LatestResult> {
  try {
    const res = await fetch("/api/latest", { cache: "no-store" });
    if (res.status === 204) return { status: "empty" };
    if (!res.ok) return { status: "empty" };

    const json = (await res.json()) as unknown;

    if (
      !json ||
      typeof json !== "object" ||
      !("publishedAt" in json) ||
      !("version" in json) ||
      !("data" in json)
    ) {
      return { status: "empty" };
    }

    return { status: "ok", snapshot: json as PublicSnapshot };
  } catch (err) {
    console.warn("fetchLatest: error", err);
    return { status: "empty" };
  }
}
