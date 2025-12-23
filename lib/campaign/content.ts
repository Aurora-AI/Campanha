/*
 * Fonte canonica de conteudo editorial para a rota Campaign.
 * Gerado a partir de lib/sandbox/mock.ts para remover dependencia campaign -> sandbox.
 *
 * Regra: components/campaign NAO devem importar lib/sandbox/mock.
 */

export type SectionFeatureData = {
  title: string;
  description: string;
  image: string;
};

export const SECTION_A_DATA: SectionFeatureData = {
  title: "Cognitive Puzzle",
  description:
    "Prototipo editorial para explorar composicao, ritmo e narrativa antes do transplante para o produto real.",
  image: "/sandbox/hero.png",
};

export type SectionGridItem = {
  id: string;
  title: string;
  category: string;
  image: string;
};

export const SECTION_GRID_DATA: SectionGridItem[] = [
  { id: "g1", title: "Puzzle Head", category: "Hero", image: "/sandbox/hero.png" },
  { id: "g2", title: "Satellite A", category: "Card", image: "/sandbox/gallery-01.svg" },
  { id: "g3", title: "Satellite B", category: "Seal", image: "/sandbox/gallery-02.svg" },
  { id: "g4", title: "Radial", category: "Gauge", image: "/sandbox/gallery-01.svg" },
];

export const MANIFESTO_DATA: { text: string } = {
  text: "A UI manifesta estados; o backend produz inteligencia.",
};
