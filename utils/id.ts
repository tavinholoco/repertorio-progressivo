/** Gera um ID único baseado em timestamp + aleatoriedade. */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/** Retorna o instante atual em formato ISO 8601. */
export function getIsoNow(): string {
  return new Date().toISOString();
}
