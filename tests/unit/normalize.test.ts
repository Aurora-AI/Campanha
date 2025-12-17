import { describe, expect, it } from "vitest";

import {
  ColumnNotFoundError,
  detectHeaderAndRows,
  inferColumns,
  normalizeRows,
  normalizeStatus,
  pendingTypeFromStatus,
} from "@/lib/metrics/normalize";
import { loadCsvRowsFixture } from "../helpers/makeRows";

describe("metrics/normalize", () => {
  it("mapeia exatamente as 6 situações canônicas", () => {
    expect(normalizeStatus("Aprovado")).toBe("APROVADO");
    expect(normalizeStatus("Reprovado")).toBe("REPROVADO");

    expect(normalizeStatus("Análise")).toBe("PENDENTE:analise");
    expect(normalizeStatus("Pendente")).toBe("PENDENTE:pendente");
    expect(normalizeStatus("Aguardando Documentos")).toBe("PENDENTE:aguardando_documentos");
    expect(normalizeStatus("Aguardando Finalizar o Cadastro")).toBe("PENDENTE:aguardando_finalizar_cadastro");
  });

  it("deriva tipo de pendência a partir do status normalizado", () => {
    expect(pendingTypeFromStatus("APROVADO")).toBeNull();
    expect(pendingTypeFromStatus("REPROVADO")).toBeNull();
    expect(pendingTypeFromStatus("PENDENTE:analise")).toBe("ANALISE");
    expect(pendingTypeFromStatus("PENDENTE:pendente")).toBe("PENDENTE");
    expect(pendingTypeFromStatus("PENDENTE:aguardando_documentos")).toBe("AGUARDANDO_DOCUMENTOS");
    expect(pendingTypeFromStatus("PENDENTE:aguardando_finalizar_cadastro")).toBe("AGUARDANDO_FINALIZAR_CADASTRO");
  });

  it("detecta header mesmo com linhas de preâmbulo", async () => {
    const rawRows = await loadCsvRowsFixture("sample.csv");
    const { header, rows } = detectHeaderAndRows(rawRows);

    expect(header).toContain("Data da proposta");
    expect(header).toContain("Loja");
    expect(header).toContain("CNPJ");
    expect(header).toContain("CPF");
    expect(header).toContain("Situação");
    expect(rows.length).toBeGreaterThan(10);
  });

  it("preserva CPF já mascarado (sem re-mask) durante normalização de linhas", async () => {
    const rawRows = await loadCsvRowsFixture("sample.csv");
    const { header, rows } = detectHeaderAndRows(rawRows);
    const normalized = normalizeRows(header, rows);

    const anyPending = normalized.find((r) => r.status.startsWith("PENDENTE:") && r.cpfMasked);
    expect(anyPending?.cpfMasked).toMatch(/\*/);
    expect(anyPending?.cpfMasked).toContain(".");
    expect(anyPending?.cpfMasked).toContain("-");
  });

  it("falha com erro claro quando faltar coluna obrigatória", () => {
    const headers = ["Data da proposta", "Loja", "CNPJ", "Situação", "Ticket 1ª compra"];
    expect(() => inferColumns(headers)).toThrowError(ColumnNotFoundError);
    expect(() => inferColumns(headers)).toThrowError("Coluna cpf não encontrada");
  });

  it("deriva loja a partir do CNPJ quando coluna Loja não existir", async () => {
    const rawRows = await loadCsvRowsFixture("sample_no_loja.csv");
    const { header, rows } = detectHeaderAndRows(rawRows);

    expect(header).toContain("Data da proposta");
    expect(header).toContain("CNPJ");
    expect(header).not.toContain("Loja");

    const normalized = normalizeRows(header, rows);
    expect(normalized.length).toBeGreaterThan(0);
    expect(normalized[0]?.store).toBe("LOJA 16 Cerro Azul - Centro");
  });

  it("normaliza CNPJ (com e sem máscara) e mantém mapeamento de loja", () => {
    const header = ["Data da proposta", "CNPJ", "CPF", "Situação", "Ticket 1ª compra"];
    const rows = [
      ["12/12/2025", "07.316.252/0011-45", "111.***.***-11", "Aprovado", "R$ 10,00"],
      ["12/12/2025", "07316252001145", "222.***.***-22", "Aprovado", "R$ 10,00"],
      ["12/12/2025", " 07 316 252 0011 45 ", "333.***.***-33", "Aprovado", "R$ 10,00"],
      ["12/12/2025", "7.316.252/0011-45", "444.***.***-44", "Aprovado", "R$ 10,00"],
    ];

    const normalized = normalizeRows(header, rows);
    expect(normalized.length).toBe(4);
    expect(new Set(normalized.map((r) => r.store))).toEqual(new Set(["LOJA 16 Cerro Azul - Centro"]));
    expect(new Set(normalized.map((r) => r.cnpj))).toEqual(new Set(["07.316.252/0011-45"]));
  });

  it("não confunde linha 'quase header' sem colunas obrigatórias (ex.: Ticket)", async () => {
    const rawRows = await loadCsvRowsFixture("sample_misleading_preamble.csv");
    const { header, headerIndex } = detectHeaderAndRows(rawRows);

    expect(headerIndex).toBe(4);
    expect(header).toContain("Ticket 1ª compra");
  });
});
