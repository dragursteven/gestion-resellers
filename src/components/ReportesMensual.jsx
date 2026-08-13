import React, { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { msFrom, monthKeyFromMs, monthLabel } from "../lib/format.js";
import { parseModelFields, num } from "../lib/reportUtils.js";
import { exportRows } from "../lib/excel.js";

const METRIC_FIELDS = [
  "Demostraciones realizadas",
  "Expos/Ferias participadas",
  "Potenciales contactados",
  "Potenciales cotizados",
];

export default function ReportesMensual() {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fields, setFields] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [scope, setScope] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [f, r] = await Promise.all([
        api.fields("reportes"),
        api.list("reportes"),
      ]);
      setFields(f.fields);
      setReportes(r.records);
    } catch (err) {
      setError(String(err.message || "No se pudieron cargar los reportes"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const models = useMemo(
    () => parseModelFields(fields.map((f) => f.name)),
    [fields]
  );

  const effectiveScope = isAdmin ? scope : user?.reseller || "";

  const rows = useMemo(() => {
    const groups = new Map();
    for (const rec of reportes) {
      const reseller = String(rec.fields?.Reseller ?? "");
      if (effectiveScope && reseller !== effectiveScope) continue;
      const mk = monthKeyFromMs(msFrom(rec.fields?.["Semana desde"]));
      if (!mk) continue;
      const key = `${mk}||${reseller}`;
      if (!groups.has(key)) {
        groups.set(key, {
          mk,
          Reseller: reseller,
          Reportes: 0,
          metrics: Object.fromEntries(METRIC_FIELDS.map((m) => [m, 0])),
          models: Object.fromEntries(
            models.map((m) => [m.name, { Vendidos: 0, Comprados: 0 }])
          ),
          totalVendidos: 0,
          totalComprados: 0,
        });
      }
      const g = groups.get(key);
      g.Reportes += 1;
      for (const mf of METRIC_FIELDS) g.metrics[mf] += num(rec.fields?.[mf]);
      for (const m of models) {
        const v = num(rec.fields?.[m.metrics.Vendidos]);
        const c = num(rec.fields?.[m.metrics.Comprados]);
        g.models[m.name].Vendidos += v;
        g.models[m.name].Comprados += c;
        g.totalVendidos += v;
        g.totalComprados += c;
      }
    }
    return [...groups.values()].sort((a, b) =>
      a.mk === b.mk ? a.Reseller.localeCompare(b.Reseller) : b.mk.localeCompare(a.mk)
    );
  }, [reportes, models, effectiveScope]);

  const resellerNames = useMemo(() => {
    const s = new Set();
    reportes.forEach((r) => {
      const v = r.fields?.Reseller;
      if (v) s.add(String(v));
    });
    return [...s].sort();
  }, [reportes]);

  function doExport() {
    if (rows.length === 0) return;
    const flat = rows.map((g) => {
      const obj = {
        Mes: monthLabel(g.mk),
        Reseller: g.Reseller,
        Reportes: g.Reportes,
        "Drones vendidos": g.totalVendidos,
        "Drones comprados": g.totalComprados,
      };
      for (const mf of METRIC_FIELDS) obj[mf] = g.metrics[mf];
      for (const m of models) {
        obj[`${m.name} Vendidos`] = g.models[m.name].Vendidos;
        obj[`${m.name} Comprados`] = g.models[m.name].Comprados;
      }
      return obj;
    });
    exportRows("Reportes Mensuales", flat);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h3 className="text-base font-bold text-ink mr-auto">
          Resumen mensual (calculado desde los reportes semanales)
        </h3>

        {isAdmin ? (
          <select
            className="field-input w-52"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            <option value="">Todos los resellers</option>
            {resellerNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        ) : null}

        <button className="btn-ghost" onClick={load} title="Actualizar">
          <RefreshCw size={16} />
        </button>
        <button className="btn-primary" onClick={doExport}>
          <Download size={16} /> Exportar Excel
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 mb-4">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-10 justify-center">
          <Loader2 className="animate-spin" size={18} /> Calculando...
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-base">
                <th className="p-2 text-left font-semibold">Mes</th>
                <th className="p-2 text-left font-semibold">Reseller</th>
                <th className="p-2 text-right font-semibold">Reportes</th>
                <th className="p-2 text-right font-semibold">Drones vendidos</th>
                <th className="p-2 text-right font-semibold">Drones comprados</th>
                <th className="p-2 text-right font-semibold">Demos</th>
                <th className="p-2 text-right font-semibold">Expos</th>
                <th className="p-2 text-right font-semibold">Pot. contactados</th>
                <th className="p-2 text-right font-semibold">Pot. cotizados</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={`${g.mk}-${g.Reseller}`} className="border-b border-line hover:bg-base">
                  <td className="p-2">{monthLabel(g.mk)}</td>
                  <td className="p-2">{g.Reseller}</td>
                  <td className="p-2 text-right">{g.Reportes}</td>
                  <td className="p-2 text-right font-medium">{g.totalVendidos}</td>
                  <td className="p-2 text-right">{g.totalComprados}</td>
                  <td className="p-2 text-right">
                    {g.metrics["Demostraciones realizadas"]}
                  </td>
                  <td className="p-2 text-right">
                    {g.metrics["Expos/Ferias participadas"]}
                  </td>
                  <td className="p-2 text-right">
                    {g.metrics["Potenciales contactados"]}
                  </td>
                  <td className="p-2 text-right">
                    {g.metrics["Potenciales cotizados"]}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-muted">
                    Sin datos para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted mt-3">
        El Excel exportado incluye además el detalle de Vendidos y Comprados por
        cada modelo.
      </p>
    </div>
  );
}
