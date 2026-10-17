/** Minúsculas, sem acentos e com espaços normalizados, para comparar textos digitados. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Cada palavra da busca precisa aparecer em algum dos campos.
 * Usa `includes`, nunca RegExp, para que o texto digitado não seja interpretado.
 */
export function matchesQuery(fields: string[], query: string): boolean {
  const terms = normalizeText(query).split(' ').filter(Boolean)
  if (terms.length === 0) return true
  const haystack = fields.map(normalizeText)
  return terms.every((term) => haystack.some((field) => field.includes(term)))
}
