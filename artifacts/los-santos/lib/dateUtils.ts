export function formatDateBR(date: string | Date): string {
  const d =
    typeof date === "string" && !date.endsWith("Z") && !date.includes("+")
      ? new Date(date + "Z")
      : new Date(date);

  return d.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
