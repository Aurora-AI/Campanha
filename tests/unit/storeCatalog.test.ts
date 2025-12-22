import { describe, it, expect } from 'vitest';
import { resolveStoreNameFromCnpj } from '@/lib/campaign/storeCatalog';

describe('storeCatalog', () => {
  it('resolve nomes canônicos por CNPJ (com e sem máscara)', () => {
    const cases: Array<{ cnpj: string; name: string }> = [
      { cnpj: '07316252000769', name: 'LOJA 01 PINHEIRINHO' },
      { cnpj: '03749830000295', name: 'LOJA 02 PIONEIROS' },
      { cnpj: '07316252000840', name: 'LOJA 03 PIONEIROS' },
      { cnpj: '07316252000688', name: 'LOJA 04 ALTO MARACANÃ' },
      { cnpj: '03749830000376', name: 'LOJA 05 PIONEIROS' },
      { cnpj: '07316252000173', name: 'LOJA 06 CENTRO' },
      { cnpj: '03749830000457', name: 'LOJA 07 CENTRO' },
      { cnpj: '07316252000254', name: 'LOJA 08 JD PAULISTA' },
      { cnpj: '03749830000619', name: 'LOJA 09 PINHEIRINHO' },
      { cnpj: '07316252000416', name: 'LOJA 10 EUCALIPTOS' },
      { cnpj: '07316252000335', name: 'LOJA 11 CENTRO' },
      { cnpj: '07316252000505', name: 'LOJA 12 CENTRO' },
      { cnpj: '03749830000538', name: 'LOJA 13 CENTRO' },
      { cnpj: '07316252001064', name: 'LOJA 14 JD PAULISTA' },
      { cnpj: '07316252000920', name: 'LOJA 15 CENTRO' },
      { cnpj: '07316252001145', name: 'LOJA 16 CENTRO' },
      { cnpj: '07316252001307', name: 'LOJA 17 SÃO GABRIEL' },
      { cnpj: '07316252001226', name: 'LOJA 18 CENTRO' },
      { cnpj: '07316252001498', name: 'LOJA 19 GUARAITUBA' },
      { cnpj: '07316252001579', name: 'LOJA 20 CENTRO' },
      { cnpj: '07316252001650', name: 'LOJA 21 CAJURU' },
    ];

    for (const c of cases) {
      expect(resolveStoreNameFromCnpj(c.cnpj)).toBe(c.name);
      const masked = c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
      expect(resolveStoreNameFromCnpj(masked)).toBe(c.name);
    }
  });

  it('retorna null para CNPJ desconhecido', () => {
    expect(resolveStoreNameFromCnpj('00.000.000/0000-00')).toBeNull();
  });
});

