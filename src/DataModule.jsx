import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
  Eye,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { displayValue } from "../lib/format.js";
import { exportToExcel } from "../lib/excel.js";
import RecordForm from "./RecordForm.jsx";
import RecordView from "./RecordView.jsx";

export default function DataModule({ module }) {
  const { isAdmin, user } = useAuth();
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [resellerFilter, setResellerFilter] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null); // record o {} para nuevo
  const [viewing, setViewing] = useState(null); // record para ver (solo lectura)
  const [busy, setBusy] = useState(false);

  const lockedReseller =
    !isAdmin && module.resellerField ? user?.reseller || "" : "";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [fRes, rRes] = await Promise.all([
        api.fields(module.key),
        api.list(module.key),
      ]);
      setFields(fRes.fields);
      setRecords(rRes.records);
      setSelected(new Set());
    } catch (err) {
      setError(String(err.message || "No se pudieron cargar los datos"));
    } finally {
      setLoading(false);
    }
  }, [module.key]);

  useEffect(() => {
    load();
  }, [load]);

  const typeMap = useMemo(() => {
    const m = new Map();
    fields.forEach((f) => m.set(f.name, f.type));
    return m;
  }, [fields]);

  const columns = useMemo(() => {
    if (module.listColumns) {
      return module.listColumns.filter((c) => typeMap.has(c));
    }
    return fields.filter((f) => f.type !== 17).map((f) => f.name);
  }, [module.listColumns, fields, typeMap]);

  const resellerOptions = useMemo(() => {
    if (!module.resellerField) return [];
    const set = new Set();
    records.forEach((r) => {
      const v = r.fields?.[module.resellerField];
      if (v) set.add(String(Array.isArray(v) ? v.join(", ") : v));
    });
    return [...set].sort();
  }, [records, module.resellerField]);

  const filtered = useMemo(() => {
    let rows = records;
    const rf = module.resellerField;
    if (rf) {
      if (lockedReseller) {
        rows = rows.filter(
          (r) => String(r.fields?.[rf] ?? "") === lockedReseller
        );
      } else if (resellerFilter) {
        rows = rows.filter(
          (r) => String(r.fields?.[rf] ?? "") === resellerFilter
        );
      }
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        columns.some((c) =>
          displayValue(r.fields?.[c], typeMap.get(c))
            .toLowerCase()
            .includes(q)
        )
      );
    }
    return rows;
  }, [records, module.resellerField, lockedReseller, resellerFilter, search, columns, typeMap]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === filtered.length) return new Set();
      return new Set(filtered.map((r) => r.id));
    });
  }

  async function onSave(values) {
    if (editing?.id) {
      await api.update(module.key, editing.id, values);
    } else {
      await api.create(module.key, values);
    }
    setEditing(null);
    await load();
  }

  async function onDelete(id) {
    if (!window.confirm("¿Eliminar este registro? Esta acción no se puede deshacer."))
      return;
    setBusy(true);
    try {
      await api.remove(module.key, id);
      await load();
    } catch (err) {
      alert(String(err.message || "No se pudo eliminar"));
    } finally {
      setBusy(false);
    }
  }

  function doExport() {
    const rows =
      selected.size > 0
        ? filtered.filter((r) => selected.has(r.id))
        : filtered;
    if (rows.length === 0) return;
    // La exportación incluye TODAS las columnas de la tabla (no solo el resumen).
    const exportColumns = fields.map((f) => f.name);
    exportToExcel(module.label, exportColumns, rows, typeMap);
  }

  return (
    <div>
      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-ink mr-auto">{module.label}</h2>

        {module.formUrl ? (
          <a
            href={module.formUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-amber"
          >
            <ExternalLink size={16} /> Cargar (Formulario)
          </a>
        ) : null}

        <button className="btn-ghost" onClick={load} title="Actualizar">
          <RefreshCw size={16} />
        </button>

        <button className="btn-ghost" onClick={doExport}>
          <Download size={16} /> Exportar Excel
        </button>

        {isAdmin ? (
          <button
            className="btn-primary"
            onClick={() => setEditing({})}
          >
            <Plus size={16} /> Nuevo
          </button>
        ) : null}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            className="field-input pl-8 w-56"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {module.resellerField && !lockedReseller ? (
          <select
            className="field-input w-56"
            value={resellerFilter}
            onChange={(e) => setResellerFilter(e.target.value)}
          >
            <option value="">Todos los resellers</option>
            {resellerOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : null}

        {lockedReseller ? (
          <span className="text-sm text-muted">
            Reseller: <strong className="text-ink">{lockedReseller}</strong>
          </span>
        ) : null}

        <span className="text-sm text-muted ml-auto">
          {filtered.length} registro(s)
          {selected.size > 0 ? ` · ${selected.size} seleccionado(s)` : ""}
        </span>
      </div>

      {error ? (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 mb-4">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-muted py-10 justify-center">
          <Loader2 className="animate-spin" size={18} /> Cargando...
        </div>
      ) : (
        <>
          {/* Tabla (escritorio) */}
          <div className="hidden md:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-base">
                  <th className="p-2 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        selected.size === filtered.length
                      }
                      onChange={toggleAll}
                    />
                  </th>
                  {columns.map((c) => (
                    <th key={c} className="p-2 text-left font-semibold text-ink whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                  <th className="p-2 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-line hover:bg-base">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="p-2 align-top">
                        {renderCell(r.fields?.[c], typeMap.get(c))}
                      </td>
                    ))}
                    <td className="p-2">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="text-muted hover:text-green"
                          onClick={() => setViewing(r)}
                          title="Ver"
                        >
                          <Eye size={16} />
                        </button>
                        {isAdmin ? (
                          <>
                            <button
                              className="text-muted hover:text-green"
                              onClick={() => setEditing(r)}
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="text-muted hover:text-red-600"
                              onClick={() => onDelete(r.id)}
                              disabled={busy}
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 2}
                      className="p-6 text-center text-muted"
                    >
                      Sin registros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (móvil) */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    className="mt-1"
                  />
                  <div className="flex gap-3">
                    <button
                      className="text-muted hover:text-green"
                      onClick={() => setViewing(r)}
                      title="Ver"
                    >
                      <Eye size={16} />
                    </button>
                    {isAdmin ? (
                      <>
                        <button
                          className="text-muted hover:text-green"
                          onClick={() => setEditing(r)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="text-muted hover:text-red-600"
                          onClick={() => onDelete(r.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
                <dl className="mt-2 space-y-1">
                  {columns.map((c) => (
                    <div key={c} className="flex justify-between gap-3">
                      <dt className="text-xs uppercase text-muted">{c}</dt>
                      <dd className="text-sm text-ink text-right">
                        {renderCell(r.fields?.[c], typeMap.get(c))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
            {filtered.length === 0 ? (
              <p className="text-center text-muted py-6">Sin registros.</p>
            ) : null}
          </div>
        </>
      )}

      {viewing ? (
        <RecordView
          title={`Ver · ${module.label}`}
          fields={fields}
          record={viewing}
          onEdit={
            isAdmin
              ? () => {
                  const r = viewing;
                  setViewing(null);
                  setEditing(r);
                }
              : null
          }
          onClose={() => setViewing(null)}
        />
      ) : null}

      {editing ? (
        <RecordForm
          title={
            editing.id ? `Editar · ${module.label}` : `Nuevo · ${module.label}`
          }
          fields={fields}
          record={editing.id ? editing : null}
          lockedReseller={lockedReseller}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

// Celda: los adjuntos se muestran como links vía /api/media.
function renderCell(value, type) {
  if (type === 17 && Array.isArray(value)) {
    if (value.length === 0) return "";
    return (
      <div className="flex flex-col gap-0.5">
        {value.map((a, i) => (
          <a
            key={a.file_token || i}
            href={api.mediaUrl(a.file_token)}
            target="_blank"
            rel="noreferrer"
            className="text-green hover:underline text-xs"
          >
            {a.name || "archivo"}
          </a>
        ))}
      </div>
    );
  }
  return displayValue(value, type);
}
