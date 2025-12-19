import { head } from "@vercel/blob";

export async function fetchLatestSnapshot(): Promise<unknown | null> {
  const blobInfo = await head("calceleve/latest.json");
  if (!blobInfo?.url) return null;

  const res = await fetch(blobInfo.url, { cache: "no-store" });
  if (!res.ok) return null;

  return res.json();
}
