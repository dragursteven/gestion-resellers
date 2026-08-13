import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { api } from "../lib/api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import RecordForm from "./RecordForm.jsx";

const F = {
  nombre: "Nombre",
  categoria: "Categoría",
  archivo: "Archivo",
  activo: "Activo",
};

export default function Documentos() {
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [f, r] = await Promise.all([
        api.fields("documentos"),
        api.list("documentos"),
      ]);
      setFields(f.fields);
      setRecords(r.records);
    } catch (err) {
      setError(String(err.message || "No se pudieron cargar los documentos"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Orden de secciones: según las opciones del campo Categoría en Lark.
  const categoryOrder = useMemo(() => {
    const cat = fields.find((f) => f.name === F.categoria);
    return cat?.options || [];
  }, [fields]);

  const sections = useMemo(() => {
    const visible = records.filter((r) =>
      isAdmin ? true : r.fields?.[F.activo] === true
    );
    const groups = new Map();
    for (const r of visible) {
      const cat = String(r.fields?.[F.categoria] ?? "") || "Sin categoría";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(r);
    }
    // ordenar por el orden de Lark, dejando al final las no listadas
    const keys = [...groups.keys()].sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    return keys.map((k) => ({ categoria: k, docs: groups.get(k) }));
  }, [records, isAdmin, categoryOrder]);

  async function onSave(values) {
    if (editing?.id) await api.update("documentos", editing.id, values);
    else await api.create("documentos", values);
    setEditing(null);
    await load();
  }

  async function onDelete(id) {
    if (!window.confirm("¿Eliminar este documento?")) return;
    try {
      await api.remove("documentos", id);
      await load();
    } catch (err) {
      alert(String(err.message || "No se pudo eliminar"));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <h2 className="text-lg font-bold text-ink mr-auto">Documentos</h2>
        <button className="btn-ghost" onClick={load} title="Actualizar">
          <RefreshCw size={16} />
        </button>
        {isAdmin ? (
          <button className="btn-primary" onClick={() => setEditing({})}>
            <Plus size={16} /> Nuevo documento
          </button>
        ) : null}
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
      ) : sections.length === 0 ? (
        <p className="text-muted">No hay documentos cargados todavía.</p>
      ) : (
        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={sec.categoria}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-1 bg-green" />
                <h3 className="font-bold text-ink">{sec.categoria}</h3>
                <span className="text-xs text-muted">
                  ({sec.docs.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.docs.map((doc) => {
                  const nombre = String(doc.fields?.[F.nombre] ?? "");
                  const url = String(doc.fields?.[F.archivo] ?? "").trim();
                  const inactivo = doc.fields?.[F.activo] !== true;
                  return (
                    <div
                      key={doc.id}
                      className="card p-5 flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-green mt-0.5">
                          <FileText size={22} />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-ink leading-snug">
                            {nombre || "Documento"}
                          </div>
                          <div className="text-xs text-muted mt-0.5">
                            {sec.categoria}
                            {isAdmin && inactivo ? " · (inactivo)" : ""}
                          </div>
                        </div>
                        {isAdmin ? (
                          <div className="flex gap-1">
                            <button
                              className="text-muted hover:text-green"
                              onClick={() => setEditing(doc)}
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="text-muted hover:text-red-600"
                              onClick={() => onDelete(doc.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary w-full justify-center"
                          >
                            <ExternalLink size={15} /> Abrir
                          </a>
                        ) : (
                          <span className="text-xs text-muted">Sin link cargado</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {editing ? (
        <RecordForm
          title={editing.id ? "Editar documento" : "Nuevo documento"}
          fields={fields}
          record={editing.id ? editing : null}
          onSave={onSave}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
