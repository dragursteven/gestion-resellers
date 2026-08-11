import React, { useMemo, useState } from "react";
import { X, Save, Loader2, Plus } from "lucide-react";
import Field from "./Field.jsx";

// Tipos de campo editables en el formulario.
const EDITABLE = new Set([1, 2, 3, 4, 5, 7, 13, 15, 17]);

// Detecta columnas del tipo "T100DB - Comprados" / " - Vendidos" / " - Stock".
const MODEL_RE = /^(.+?)\s*-\s*(Comprados|Vendidos|Stock)$/i;
const METRICS = ["Comprados", "Vendidos", "Stock"];

export default function RecordForm({
  title,
  fields,
  record,
  lockedReseller,
  onSave,
  onClose,
}) {
  const editable = useMemo(
    () => fields.filter((f) => EDITABLE.has(f.type)),
    [fields]
  );

  // Separa los campos de modelos del resto.
  const { models, modelFieldNames, normalFields } = useMemo(() => {
    const map = new Map(); // modelo -> { Comprados, Vendidos, Stock }
    const order = [];
    const modelNames = new Set();
    for (const f of editable) {
      const m = MODEL_RE.exec(f.name);
      if (m) {
        const model = m[1].trim();
        const metric = m[2][0].toUpperCase() + m[2].slice(1).toLowerCase();
        if (!map.has(model)) {
          map.set(model, {});
          order.push(model);
        }
        map.get(model)[metric] = f.name;
        modelNames.add(f.name);
      }
    }
    return {
      models: order.map((name) => ({ name, metrics: map.get(name) })),
      modelFieldNames: modelNames,
      normalFields: editable.filter((f) => !modelNames.has(f.name)),
    };
  }, [editable]);

  const [values, setValues] = useState(() => {
    const init = {};
    for (const f of editable) {
      const v = record?.fields?.[f.name];
      init[f.name] = v ?? (f.type === 4 || f.type === 17 ? [] : "");
    }
    if (lockedReseller && init.Reseller !== undefined) {
      init.Reseller = lockedReseller;
    }
    return init;
  });

  // Modelos ya seleccionados (los que tienen algún valor cargado en el registro).
  const [selected, setSelected] = useState(() => {
    const s = new Set();
    for (const m of models) {
      const has = METRICS.some((k) => {
        const fn = m.metrics[k];
        const v = fn ? record?.fields?.[fn] : undefined;
        return v !== undefined && v !== null && v !== "";
      });
      if (has) s.add(m.name);
    }
    return s;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function toggleModel(name) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        // limpia sus valores al quitarlo
        const m = models.find((x) => x.name === name);
        if (m)
          setValues((pv) => {
            const nv = { ...pv };
            METRICS.forEach((k) => {
              if (m.metrics[k]) nv[m.metrics[k]] = "";
            });
            return nv;
          });
      } else {
        next.add(name);
      }
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Asegura que los modelos NO seleccionados vayan vacíos.
      const finalValues = { ...values };
      for (const m of models) {
        if (!selected.has(m.name)) {
          METRICS.forEach((k) => {
            if (m.metrics[k]) finalValues[m.metrics[k]] = "";
          });
        }
      }
      await onSave(finalValues);
    } catch (err) {
      setError(String(err.message || "No se pudo guardar"));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-start justify-center overflow-y-auto p-4">
      <div className="card w-full max-w-2xl my-8">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold text-ink">{title}</h2>
          <button className="text-muted hover:text-ink" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {normalFields.map((f) => {
              const full = f.type === 17 || f.type === 4;
              const disabled = f.name === "Reseller" && Boolean(lockedReseller);
              return (
                <div key={f.name} className={full ? "sm:col-span-2" : ""}>
                  <label className="field-label">{f.name}</label>
                  {disabled ? (
                    <input
                      className="field-input bg-base"
                      value={values[f.name] ?? ""}
                      disabled
                    />
                  ) : (
                    <Field
                      field={f}
                      value={values[f.name]}
                      onChange={(v) => setValue(f.name, v)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Sección de modelos (solo aparece si la tabla tiene columnas por modelo) */}
          {models.length > 0 ? (
            <div className="mt-6 border-t border-line pt-4">
              <label className="field-label">
                Modelos (elegí los que compraste / vendiste esta semana)
              </label>

              <div className="flex flex-wrap gap-2 mb-4">
                {models.map((m) => {
                  const on = selected.has(m.name);
                  return (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => toggleModel(m.name)}
                      className={
                        "px-3 py-1 text-sm border transition-colors " +
                        (on
                          ? "bg-green text-white border-green"
                          : "bg-white text-ink border-line hover:bg-base")
                      }
                    >
                      {on ? null : <Plus size={12} className="inline mr-1" />}
                      {m.name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {models
                  .filter((m) => selected.has(m.name))
                  .map((m) => (
                    <div
                      key={m.name}
                      className="border border-line p-3 bg-base"
                    >
                      <div className="font-semibold text-sm text-ink mb-2">
                        {m.name}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {METRICS.map((k) =>
                          m.metrics[k] ? (
                            <div key={k}>
                              <label className="field-label">{k}</label>
                              <input
                                type="number"
                                className="field-input"
                                value={values[m.metrics[k]] ?? ""}
                                onChange={(e) =>
                                  setValue(
                                    m.metrics[k],
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  ))}
                {selected.size === 0 ? (
                  <p className="text-sm text-muted">
                    No seleccionaste ningún modelo todavía.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 mt-4">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary" disabled={saving}>
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
