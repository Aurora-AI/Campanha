import { describe, it, expect } from 'vitest';
import { normalizeGroupKey, groupLabelFromKey, shortGroupLabel } from '@/lib/campaign/groupIdentity';

describe('groupIdentity', () => {
  describe('normalizeGroupKey', () => {
    it('aceita chaves simples A/B/C', () => {
      expect(normalizeGroupKey('A')).toBe('A');
      expect(normalizeGroupKey('B')).toBe('B');
      expect(normalizeGroupKey('C')).toBe('C');
    });

    it('parse Grupo X (case-insensitive)', () => {
      expect(normalizeGroupKey('Grupo A')).toBe('A');
      expect(normalizeGroupKey('GRUPO B')).toBe('B');
      expect(normalizeGroupKey('grupo c')).toBe('C');
    });

    it('retorna OUTROS para input inválido', () => {
      expect(normalizeGroupKey('X')).toBe('OUTROS');
      expect(normalizeGroupKey('Alpha')).toBe('OUTROS');
      expect(normalizeGroupKey(null)).toBe('OUTROS');
      expect(normalizeGroupKey(undefined)).toBe('OUTROS');
      expect(normalizeGroupKey('')).toBe('OUTROS');
    });

    it('idempotente: A → A → A', () => {
      const once = normalizeGroupKey('A');
      const twice = normalizeGroupKey(once);
      expect(twice).toBe('A');
    });
  });

  describe('groupLabelFromKey', () => {
    it('gera label "Grupo X" para X válido', () => {
      expect(groupLabelFromKey('A')).toBe('Grupo A');
      expect(groupLabelFromKey('B')).toBe('Grupo B');
      expect(groupLabelFromKey('C')).toBe('Grupo C');
    });

    it('retorna "Outros" para inválido', () => {
      expect(groupLabelFromKey('X')).toBe('Outros');
      expect(groupLabelFromKey(null)).toBe('Outros');
    });

    it('idempotente: "Grupo A" → "Grupo A"', () => {
      const label = groupLabelFromKey('Grupo A');
      expect(label).toBe('Grupo A');
      const twice = groupLabelFromKey(label);
      expect(twice).toBe('Grupo A');
    });

    it('não confunde com index: 0→A, 1→B, 2→C', () => {
      // Regressão: garantir que o label NUNCA vem de índice
      expect(groupLabelFromKey('A')).toBe('Grupo A');
      expect(groupLabelFromKey('B')).toBe('Grupo B');
      expect(groupLabelFromKey('C')).toBe('Grupo C');
      // Se alguém tentar passar 0, 1, 2, vira OUTROS
      expect(groupLabelFromKey('0')).toBe('Outros');
      expect(groupLabelFromKey('1')).toBe('Outros');
      expect(groupLabelFromKey('2')).toBe('Outros');
    });
  });

  describe('shortGroupLabel', () => {
    it('retorna label derivado de normalizeGroupKey', () => {
      expect(shortGroupLabel('A')).toBe('Grupo A');
      expect(shortGroupLabel('Grupo B')).toBe('Grupo B');
      expect(shortGroupLabel('C')).toBe('Grupo C');
      expect(shortGroupLabel('Grupo A')).toBe('Grupo A');
    });
  });

  describe('regressão: sort não altera identidade', () => {
    it('ordenar grupos por score não muda label', () => {
      const groups = [
        { key: 'A', score: 50 },
        { key: 'B', score: 100 },
        { key: 'C', score: 75 },
      ];

      // Simular sort por score
      const sorted = [...groups].sort((a, b) => b.score - a.score);
      // Resultado: B (100), C (75), A (50)
      // MAS: labels permanecem os mesmos
      const labels = sorted.map((g) => groupLabelFromKey(g.key));
      expect(labels).toEqual(['Grupo B', 'Grupo C', 'Grupo A']);
      // Nunca: ['Grupo B', 'Grupo C', 'Grupo A'][0,1,2] → reindexar
    });
  });
});
