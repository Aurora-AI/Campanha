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
});

