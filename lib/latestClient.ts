// Client-only loader for the public latest snapshot
// Ensures no caching and simple status mapping without throwing

export type LatestResult = {
  status: "empty" | "ok";
  snapshot?: any;
};

export async function fetchLatest(): Promise<LatestResult> {
  try {
    const res = await fetch("/api/latest", { cache: "no-store" });
    if (res.status === 204) {
      return { status: "empty" };
    }
    if (res.ok) {
      const json = await res.json();
      return { status: "ok", snapshot: json };
    }
    console.warn("fetchLatest: unexpected status", res.status);
    return { status: "empty" };
  } catch (err) {
    console.warn("fetchLatest: error", err);
    return { status: "empty" };
  }
}
