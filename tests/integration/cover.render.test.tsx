import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import HomePageClient from "@/components/pages/HomePageClient";
import { computeMetrics } from "@/lib/metrics/compute";
import { buildHeroPayload } from "@/lib/hero/buildHeroPayload";
import { loadFixtureJson } from "../helpers/makeRows";

type BlobPayload = {
  meta: { uploadedAt: string };
  data: { rows: string[][] };
};

describe("integration: Cover (home)", () => {
  it("renderiza home Cognitive Puzzle (client)", async () => {
    const blobPayload = await loadFixtureJson<BlobPayload>("sample_payload.json");
    const metrics = computeMetrics({ uploadedAt: blobPayload.meta.uploadedAt, rawRows: blobPayload.data.rows });
    const hero = buildHeroPayload(metrics);

    render(<HomePageClient state={{ status: "ok", payload: hero }} />);

    expect((await screen.findAllByText(/Cognitive Puzzle/i)).length).toBeGreaterThan(0);
    expect(await screen.findByText(/Estado da campanha/i)).toBeInTheDocument();
    expect((await screen.findAllByText(hero.rightSatellite.value)).length).toBeGreaterThan(0);
  });
});
