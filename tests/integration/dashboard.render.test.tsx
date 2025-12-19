import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import Dashboard from "@/components/_legacy/Dashboard";
import { computeMetrics } from "@/lib/metrics/compute";
import { server } from "../helpers/mswServer";
import { loadFixtureJson } from "../helpers/makeRows";

type BlobPayload = {
  meta: { uploadedAt: string };
  data: { rows: string[][] };
};

describe("integration: Dashboard", () => {
  it("renderiza headline, ranking e ao menos 1 card de loja", async () => {
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");
    const metrics = computeMetrics({ uploadedAt: blobPayload.meta.uploadedAt, rawRows: blobPayload.data.rows });

    server.use(http.get("http://localhost/api/metrics", () => HttpResponse.json(metrics)));

    render(<Dashboard />);

    expect(await screen.findByText(/Total aprovados/i)).toBeInTheDocument();
    expect((await screen.findAllByText(String(metrics.headline.totalApproved))).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Ranking geral/i)).toBeInTheDocument();
    expect((await screen.findAllByText(metrics.stores[0]!.store)).length).toBeGreaterThan(0);
  });
});
