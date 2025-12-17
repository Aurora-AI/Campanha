export type CsvDelimiter = "\t" | ";";

const normalizeNewlines = (value: string) => String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

export function detectDelimiter(csvText: string): CsvDelimiter {
  const sample = normalizeNewlines(csvText).slice(0, 32_768);
  const lines = sample.split("\n").slice(0, 10);

  let tabs = 0;
  let semicolons = 0;
  for (const line of lines) {
    for (const ch of line) {
      if (ch === "\t") tabs += 1;
      else if (ch === ";") semicolons += 1;
    }
  }

  return tabs > semicolons ? "\t" : ";";
}

