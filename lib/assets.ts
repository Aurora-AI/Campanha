export const assets = {
  images: {
    puzzle: "/images/puzzle.png",
    heroFinal: "/images/hero-final.png",
  },
} as const;

export type AssetImageKey = keyof typeof assets.images;

