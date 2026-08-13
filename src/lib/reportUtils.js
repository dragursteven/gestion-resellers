// Utilidades para interpretar las columnas por modelo de los Reportes Semanales.
// Reconoce nombres tipo "T100DB - Comprados", "T100DB - Vendidos", "T100DB - Stock".

const MODEL_RE = /^(.+?)\s*-\s*(Comprados|Vendidos|Stock)$/i;

export function parseModelFields(fieldNames) {
  const map = new Map(); // modelo -> { Comprados, Vendidos, Stock }
  const order = [];
  for (const name of fieldNames) {
    const m = MODEL_RE.exec(name);
    if (!m) continue;
    const model = m[1].trim();
    const metric = m[2][0].toUpperCase() + m[2].slice(1).toLowerCase();
    if (!map.has(model)) {
      map.set(model, {});
      order.push(model);
    }
    map.get(model)[metric] = name;
  }
  return order.map((name) => ({ name, metrics: map.get(name) }));
}

export function num(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

// Suma total de "Vendidos" (todos los modelos) en un registro.
export function sumVendidos(record, models) {
  let total = 0;
  for (const m of models) {
    if (m.metrics.Vendidos) total += num(record.fields?.[m.metrics.Vendidos]);
  }
  return total;
}
