// Helpers compartilhados (normalização, split etc.)

export type TipoSkill = 'Hard' | 'Soft';

// Normaliza para comparar (case/acentos-insensível)
export function normKey(s: string) {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Divide entrada em múltiplos itens (vírgula, ponto e vírgula ou quebra de linha)
export function splitBulk(input: string) {
  return input
    .split(/[,\n;]+/g)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}
