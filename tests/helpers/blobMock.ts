export type FetchLikeResponse = {
  ok: boolean;
  status?: number;
  json: () => Promise<unknown>;
};

export const okJson = (value: unknown): FetchLikeResponse => ({
  ok: true,
  json: async () => value,
});

export const notFoundJson = (value: unknown): FetchLikeResponse => ({
  ok: false,
  status: 404,
  json: async () => value,
});

export function getLastPutJson(putMock: { mock: { calls: unknown[][] } }): unknown {
  const calls = putMock?.mock?.calls ?? [];
  if (calls.length === 0) throw new Error("Expected put() to be called.");
  const last = calls[calls.length - 1] ?? [];
  const body = last[1];
  if (typeof body !== "string") throw new Error("Expected put() body to be a JSON string.");
  return JSON.parse(body) as unknown;
}

