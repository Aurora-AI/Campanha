import type { DashboardData } from "./pipeline";

export type PublicSnapshot = {
  publishedAt: string;
  version: string;
  sourceFileName?: string;
  data: DashboardData;
};

type PublishResult =
  | { success: true; url?: string }
  | { success: false; error: string };

export async function publishSnapshot(
  snapshot: PublicSnapshot,
  token: string
): Promise<PublishResult> {
  try {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify(snapshot),
      cache: "no-store",
    });

    if (res.status === 401) return { success: false, error: "Token inválido" };
    if (!res.ok) return { success: false, error: "Falha ao publicar" };

    return { success: true, ...(await res.json()) };
  } catch {
    return { success: false, error: "Erro de rede ao publicar" };
  }
}

export async function loadLatestSnapshot(): Promise<PublicSnapshot | null> {
  try {
    const res = await fetch("/api/latest", { cache: "no-store" });
    if (res.status === 204) return null;
    if (!res.ok) return null;

    const json = (await res.json()) as unknown;

    if (
      !json ||
      typeof json !== "object" ||
      !("publishedAt" in json) ||
      !("version" in json) ||
      !("data" in json)
    ) {
      return null;
    }

    return json as PublicSnapshot;
  } catch {
    return null;
  }
}
