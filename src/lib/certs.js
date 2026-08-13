// Serializa/deserializa la lista de certificaciones de un empleado.
// Se guarda en un único campo de texto en Lark, una por línea:
//   Nombre de la certificación | N° de diploma

export function parseCerts(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("|");
      if (idx === -1) return { nombre: line.trim(), diploma: "" };
      return {
        nombre: line.slice(0, idx).trim(),
        diploma: line.slice(idx + 1).trim(),
      };
    });
}

export function serializeCerts(rows) {
  return (rows || [])
    .filter((r) => String(r.nombre || "").trim() !== "")
    .map((r) => `${String(r.nombre).trim()} | ${String(r.diploma || "").trim()}`)
    .join("\n");
}
