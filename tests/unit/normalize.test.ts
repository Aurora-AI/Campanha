import { describe, expect, it } from "vitest";

import {
  ColumnNotFoundError,
  detectHeaderAndRows,
  inferColumns,
  normalizeRows,
  normalizeStatus,
} from "@/lib/metrics/normalize";
import { loadCsvRowsFixture } from "../helpers/makeRows";

describe("metrics/normalize (cards-only)", () => {
  it("classifica Situação conforme contrato e nunca lança por status desconhecido", () => {
    expect(normalizeStatus("Aprovado")).toEqual({ status: "APROVADO" });
    expect(normalizeStatus("Reprovado")).toEqual({ status: "REPROVADO" });

    expect(normalizeStatus("Analise")).toEqual({ status: "EM_ANDAMENTO", pendingType: "ANALISE" });
    expect(normalizeStatus("Pendente")).toEqual({ status: "EM_ANDAMENTO", pendingType: "PENDENTE" });
    expect(normalizeStatus("Aguardando Documentos")).toEqual({
      status: "EM_ANDAMENTO",
      pendingType: "AGUARDANDO_DOCUMENTOS",
    });
    expect(normalizeStatus("Aguardando Finalizar o Cadastro")).toEqual({
      status: "EM_ANDAMENTO",
      pendingType: "AGUARDANDO_FINALIZAR_CADASTRO",
    });

    expect(normalizeStatus("")).toEqual({ status: "IGNORADO" });
    expect(normalizeStatus("Situação")).toEqual({ status: "IGNORADO" });
    expect(normalizeStatus("Qualquer coisa")).toEqual({ status: "IGNORADO" });
  });

  it("detecta header cards-only mesmo com preâmbulo (TSV)", async () => {
    const rawRows = await loadCsvRowsFixture("sample_cards_only.tsv");
    const { header, rows, headerIndex } = detectHeaderAndRows(rawRows);

    expect(headerIndex).toBe(4);
    expect(header).toContain("CNPJ");
    expect(header).toContain("Número da Proposta");
    expect(header).toContain("Situação");
    expect(rows.length).toBeGreaterThan(5);
  });

  it("aceita dataset mínimo (CNPJ + Número da Proposta + Situação)", () => {
    const header = ["CNPJ", "Número da Proposta", "Situação"];
    const rows = [
      ["07.316.252/0011-45", "1001", "Aprovado"],
      ["07.316.252/0011-45", "1002", "Pendente"],
    ];

    const normalized = normalizeRows(header, rows);
    expect(normalized.length).toBe(2);
    expect(normalized[0]?.store).toBe("LOJA 16 Cerro Azul - Centro");
    expect(normalized[0]?.cnpj).toBe("07.316.252/0011-45");
    expect(normalized[0]?.proposalId).toBe("1001");
    expect(normalized[0]?.isApproved).toBe(true);
    expect(normalized[1]?.isApproved).toBe(false);
  });

  it("falha com erro claro quando faltar coluna obrigatória", () => {
    expect(() => inferColumns(["CNPJ", "Situação"])).toThrowError(ColumnNotFoundError);
    expect(() => inferColumns(["CNPJ", "Situação"])).toThrowError("Coluna número da proposta não encontrada");

    expect(() => inferColumns(["Número da Proposta", "Situação"])).toThrowError(ColumnNotFoundError);
    expect(() => inferColumns(["Número da Proposta", "Situação"])).toThrowError("Coluna cnpj não encontrada");

    expect(() => inferColumns(["CNPJ", "Número da Proposta"])).toThrowError(ColumnNotFoundError);
    expect(() => inferColumns(["CNPJ", "Número da Proposta"])).toThrowError("Coluna situação não encontrada");
  });

  it("normaliza CNPJ (com e sem máscara) e mantém mapeamento de loja", () => {
    const header = ["CNPJ", "Número da Proposta", "Situação", "Data de entrada", "CPF"];
    const rows = [
      ["07.316.252/0011-45", "1001", "Aprovado", "12/12/2025", "111.***.***-11"],
      ["07316252001145", "1002", "Aprovado", "12/12/2025", "222.***.***-22"],
      [" 07 316 252 0011 45 ", "1003", "Aprovado", "12/12/2025", "333.***.***-33"],
      ["7.316.252/0011-45", "1004", "Aprovado", "12/12/2025", "444.***.***-44"],
    ];

    const normalized = normalizeRows(header, rows);
    expect(normalized.length).toBe(4);
    expect(new Set(normalized.map((r) => r.store))).toEqual(new Set(["LOJA 16 Cerro Azul - Centro"]));
    expect(new Set(normalized.map((r) => r.cnpj))).toEqual(new Set(["07.316.252/0011-45"]));
    expect(new Set(normalized.map((r) => r.date))).toEqual(new Set(["2025-12-12"]));
  });

  it("não confunde linha de preâmbulo com Ticket quando faltar Número da Proposta", async () => {
    const rawRows = await loadCsvRowsFixture("sample_cards_misleading_preamble.tsv");
    const { header, headerIndex } = detectHeaderAndRows(rawRows);

    expect(headerIndex).toBe(4);
    expect(header).toContain("CNPJ");
    expect(header).toContain("Número da Proposta");
    expect(header).toContain("Situação");
  });
});

