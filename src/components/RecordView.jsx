import React, { useMemo } from "react";
import { X, Pencil, Paperclip } from "lucide-react";
import { api } from "../lib/api.js";
import { displayValue } from "../lib/format.js";

const MODEL_RE = /^(.+?)\s*-\s*(Comprados|Vendidos|Stock)$/i;
const METRICS = ["Comprados", "Vendidos", "Stock"];

// Ficha de SOLO LECTURA de un registro, con la misma estética del formulario.
export default function RecordView({ title, fields, record, onEdit, onClose }) {
  const { models, modelFieldNames, normalFields } = useMemo(() => {
    const map = new Map();
    const order = [];
    const names = new Set();
    for (const f of fields) {
      const m = MODEL_RE.exec(f.name);
      if (m) {
        const model = m[1].trim();
        const metric = m[2][0].toUpperCase() + m[2].slice(1).toLowerCase();
        if (!map.has(model)) {
          map.set(model, {});
          order.push(model);
        }
        map.get(model)[metric] = f.name;
        names.add(f.name);
      }
    }
    return {
      models: order.map((name) => ({ name, metrics: map.get(name) })),
      modelFieldNames: names,
      normalFields: fields.filter((f) => !names.has(f.name)),
    };
  }, [fields]);

  const f = record?.fields || {};

  // Modelos que tienen al menos un valor cargado.
  const modelsWithData = models.filter((m) =>
    METRICS.some((k) => {
      const fn = m.metrics[k];
      const v = fn ? f[fn] : undefined;
      return v !== undefined && v !== null && v !== "";
    })
  );

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center overflow-y-auto p-4">
      <div className="card w-full max-w-2xl my-8">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold text-ink">{title}</h2>
          <div className="flex items-center gap-2">
            {onEdit ? (
              <button className="btn-ghost" onClick={onEdit}>
                <Pencil size={15} /> Editar
              </button>
            ) : null}
            <button className="text-muted hover:text-ink" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {normalFields.map((field) => {
              const value = f[field.name];
              const isAttach = field.type === 17;
              const full = isAttach;
              return (
                <div key={field.name} className={full ? "sm:col-span-2" : ""}>
                  <dt className="field-label">{field.name}</dt>
                  <dd className="text-sm text-ink border-b border-line pb-1 min-h-[1.5rem]">
                    {isAttach ? (
                      <AttachmentList value={value} />
                    ) : (
                      displayValue(value, field.type) || (
                        <span className="text-muted">—</span>
                      )
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          {models.length > 0 ? (
            <div className="mt-6 border-t border-line pt-4">
              <div className="field-label mb-2">Modelos</div>
              {modelsWithData.length === 0 ? (
                <p className="text-sm text-muted">
                  Sin movimientos de modelos en este reporte.
                </p>
              ) : (
                <table className="w-full text-sm border border-line">
                  <thead>
                    <tr className="bg-base border-b border-line">
                      <th className="text-left p-2 font-semibold">Modelo</th>
                      <th className="text-right p-2 font-semibold">Comprados</th>
                      <th className="text-right p-2 font-semibold">Vendidos</th>
                      <th className="text-right p-2 font-semibold">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelsWithData.map((m) => (
                      <tr key={m.name} className="border-b border-line">
                        <td className="p-2 font-medium">{m.name}</td>
                        {METRICS.map((k) => {
                          const v = m.metrics[k] ? f[m.metrics[k]] : "";
                          return (
                            <td key={k} className="p-2 text-right">
                              {v === "" || v === undefined || v === null
                                ? "—"
                                : v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}

          <div className="flex justify-end mt-6">
            <button className="btn-ghost" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttachmentList({ value }) {
  const arr = Array.isArray(value) ? value : [];
  if (arr.length === 0) return <span className="text-muted">—</span>;
  return (
    <div className="flex flex-col gap-0.5 pt-1">
      {arr.map((a, i) => (
        <a
          key={a.file_token || i}
          href={api.mediaUrl(a.file_token)}
          target="_blank"
          rel="noreferrer"
          className="text-green hover:underline flex items-center gap-1"
        >
          <Paperclip size={13} /> {a.name || "archivo"}
        </a>
      ))}
    </div>
  );
}
