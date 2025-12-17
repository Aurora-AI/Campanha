import fs from "node:fs/promises";
import path from "node:path";

import Papa from "papaparse";
import { detectDelimiter } from "@/lib/csv";

const fixturesDir = path.resolve(__dirname, "..", "fixtures");

export async function loadFixtureText(fileName: string): Promise<string> {
  const full = path.join(fixturesDir, fileName);
  return await fs.readFile(full, "utf8");
}

export async function loadFixtureJson<T = unknown>(fileName: string): Promise<T> {
  const txt = await loadFixtureText(fileName);
  return JSON.parse(txt) as T;
}

export async function loadCsvRowsFixture(fileName: string): Promise<string[][]> {
  const csvText = await loadFixtureText(fileName);
  return await new Promise((resolve, reject) => {
    const delimiter = detectDelimiter(csvText);
    Papa.parse(csvText, {
      encoding: "UTF-8",
      delimiter,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as string[][]),
      error: (err: unknown) => reject(err),
    });
  });
}
