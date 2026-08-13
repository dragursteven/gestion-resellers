import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  FileText,
  Users,
  Presentation,
  Target,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  msFrom,
  monthKeyFromMs,
  currentMonthKey,
  monthLabel,
} from "../lib/format.js";
import { parseModelFields, sumVendidos } from "../lib/reportUtils.js";

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportFields, setReportFields] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [demos, setDemos] = useState([]);
  const [resellers, setResellers] = useState([]);

  const [scope, setScope] = useState(""); // "" = todos (solo Admin)
  const [onlyThisMonth, setOnlyThisMonth] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [rf, rr, cc, dd, rs] = await Promise.all([
          api.fields("reportes"),
          api.list("reportes"),
          api.list("clientes"),
          api.list("demostraciones"),
          isAdmin ? api.list("resellers") : Promise.resolve({ records: [] }),
        ]);
        if (!alive) return;
        setReportFields(rf.fields);
        setReportes(rr.records);
        setClientes(cc.records);
        setDemos(dd.records);
        setResellers(rs.records);
      } catch (err) {
        if (alive) setError(String(err.message || "No se pudieron cargar los datos"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  const models = useMemo(
    () => parseModelFields(reportFields.map((f) => f.name)),
    [reportFields]
  );

  const effectiveScope = isAdmin ? scope : user?.reseller || "";
  const monthKey = currentMonthKey();

  const matchReseller = (rec) => {
    if (!effectiveScope) return true;
    return String(rec.fields?.Reseller ?? "") === effectiveScope;
  };
  const inMonth = (rec, dateField) => {
    if (!onlyThisMonth) return true;
    const ms = msFrom(rec.fields?.[dateField]);
    return monthKeyFromMs(ms) === monthKey;
  };

  const metrics = useMemo(() => {
    const rep = reportes.filter((r) => matchReseller(r) && inMonth(r, "Semana desde"));
    const dem = demos.filter((r) => matchReseller(r) && inMonth(r, "Fecha de la Demo"));
    const cli = clientes.filter((r) => matchReseller(r)); // sin fecha: no filtra por mes
    const ventas = rep.reduce((acc, r) => acc + sumVendidos(r, models), 0);
    return {
      ventas,
      reportes: rep.length,
      clientes: cli.length,
      demos: dem.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportes, demos, clientes, models, effectiveScope, onlyThisMonth]);

  const resellerNames = useMemo(
    () =>
      resellers
        .map((r) => String(r.fields?.["Nombre del Reseller"] ?? ""))
        .filter(Boolean)
        .sort(),
    [resellers]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted py-16 justify-center">
        <Loader2 className="animate-spin" size={18} /> Cargando métricas...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-ink mr-auto">Menú Principal</h2>

        {isAdmin ? (
          <select
            className="field-input w-56"
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
        ) : (
          <span className="text-sm text-muted">
            Reseller: <strong className="text-ink">{effectiveScope}</strong>
          </span>
        )}

        <div className="inline-flex border border-line">
          <button
            className={
              "px-3 py-2 text-sm " +
              (!onlyThisMonth ? "bg-green text-white" : "bg-white text-ink")
            }
            onClick={() => setOnlyThisMonth(false)}
          >
            Histórico general
          </button>
          <button
            className={
              "px-3 py-2 text-sm border-l border-line " +
              (onlyThisMonth ? "bg-green text-white" : "bg-white text-ink")
            }
            onClick={() => setOnlyThisMonth(true)}
          >
            {monthLabel(monthKey)}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 mb-4">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp size={20} />}
          label="Ventas (drones vendidos)"
          value={metrics.ventas}
        />
        <MetricCard
          icon={<FileText size={20} />}
          label="Reportes"
          value={metrics.reportes}
        />
        <MetricCard
          icon={<Users size={20} />}
          label="Usuarios Finales"
          value={metrics.clientes}
          note={onlyThisMonth ? "Total (sin fecha por registro)" : undefined}
        />
        <MetricCard
          icon={<Presentation size={20} />}
          label="Demostraciones"
          value={metrics.demos}
        />
      </div>

      {/* Metas (próximamente) */}
      <div className="card mt-6 p-5 border-dashed">
        <div className="flex items-center gap-2 text-muted">
          <Target size={18} />
          <span className="font-semibold text-ink">Metas del reseller</span>
          <span className="text-xs bg-base border border-line px-2 py-0.5">
            Próximamente
          </span>
        </div>
        <p className="text-sm text-muted mt-2">
          Acá vas a poder fijar objetivos (ventas, demos, reportes) por reseller
          y ver el avance contra la meta.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, note }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-green mb-3">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-ink leading-none">{value}</div>
      {note ? <div className="text-xs text-muted mt-2">{note}</div> : null}
    </div>
  );
}
