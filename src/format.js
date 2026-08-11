// Formateo seguro de valores de Lark para mostrar en tabla/tarjetas.
// Los tipos de campo de Lark: 1 texto, 2 número, 3 sel.única, 4 sel.múltiple,
// 5 fecha, 7 casilla, 17 adjunto, etc.

export function fieldTypeOf(fields, name) {
  const f = (fields || []).find((x) => x.name === name);
  return f ? f.type : 1;
}

export function isAttachment(type) {
  return type === 17;
}

export function displayValue(value, type) {
  if (value === undefined || value === null || value === "") return "";

  switch (type) {
    case 5:
    case 1001: // fecha de creación
    case 1002: {
      // fecha (ms)
      const ms = typeof value === "number" ? value : Number(value);
      if (!ms || Number.isNaN(ms)) return "";
      const d = new Date(ms);
      return d.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    case 7:
      return value === true ? "Sí" : "No";
    case 4:
      return Array.isArray(value) ? value.join(", ") : String(value);
    case 17:
      return Array.isArray(value)
        ? `${value.length} archivo(s)`
        : "1 archivo";
    default:
      if (Array.isArray(value)) {
        return value
          .map((v) => (v && typeof v === "object" ? v.text ?? "" : v))
          .join(", ");
      }
      if (value && typeof value === "object") return String(value.text ?? "");
      return String(value ?? "");
  }
}

// Valor plano para exportar a Excel.
export function exportValue(value, type) {
  if (type === 17) {
    return Array.isArray(value)
      ? value.map((a) => a.name).join(" | ")
      : "";
  }
  return displayValue(value, type);
}

export function toDateInput(value) {
  if (!value) return "";
  const ms = typeof value === "number" ? value : Number(value);
  if (!ms || Number.isNaN(ms)) return "";
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
