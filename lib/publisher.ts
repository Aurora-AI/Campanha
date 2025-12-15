import { DashboardData } from "./pipeline";

export interface PublicSnapshot {
  publishedAt: string;
  sourceFileName?: string;
  version: string;
  data: DashboardData;
}

export async function publishSnapshot(
  snapshot: PublicSnapshot,
  adminToken: string
): Promise<{ success: boolean; error?: string; publishedAt?: string }> {
  try {
    const response = await fetch("/api/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(snapshot),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || "Erro desconhecido ao publicar",
      };
    }

    const result = await response.json();
    return {
      success: true,
      publishedAt: result.publishedAt,
    };
  } catch (error) {
    console.error("Erro ao publicar snapshot:", error);
    return {
      success: false,
      error: "Erro de rede ao publicar snapshot",
    };
  }
}

export async function loadLatestSnapshot(): Promise<PublicSnapshot | null> {
  try {
    const response = await fetch("/api/latest", {
      cache: "no-store",
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Erro ao carregar snapshot");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao carregar latest:", error);
    return null;
  }
}
