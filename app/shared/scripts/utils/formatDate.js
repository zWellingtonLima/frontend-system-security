/**
 * Formata uma data ISO para exibição.
 * "2026-03-19T15:45:24" → "19/03/2026 15:45"
 */
export function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
