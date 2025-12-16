import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import Home from "@/app/page";
import { computeMetrics } from "@/lib/metrics/compute";
import { server } from "../helpers/mswServer";
import { loadFixtureJson } from "../helpers/makeRows";

type BlobPayload = {
  meta: { uploadedAt: string };
  data: { rows: string[][] };
};

describe("integration: Cover (home)", () => {
  it("renderiza capa editorial com seções principais consumindo /api/metrics", async () => {
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");
    const metrics = computeMetrics({ uploadedAt: blobPayload.meta.uploadedAt, rawRows: blobPayload.data.rows });

    server.use(http.get("http://localhost/api/metrics", () => HttpResponse.json(metrics)));

    render(<Home />);

    expect(await screen.findByText(/Destaques do dia/i)).toBeInTheDocument();
    expect(await screen.findByText(/Líderes do período/i)).toBeInTheDocument();
    expect(await screen.findByText(/Radar do gerente/i)).toBeInTheDocument();
    expect((await screen.findAllByText(String(metrics.headline.totalApproved))).length).toBeGreaterThan(0);
  });
});

