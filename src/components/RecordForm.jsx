import React, { useMemo, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import Field from "./Field.jsx";

// Tipos de campo editables en el formulario.
const EDITABLE = new Set([1, 2, 3, 4, 5, 7, 13, 15, 17]);

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

  const [values, setValues] = useState(() => {
    const init = {};
    for (const f of editable) {
      const v = record?.fields?.[f.name];
      init[f.name] = v ?? (f.type === 4 || f.type === 17 ? [] : "");
    }
    // Si el reseller está bloqueado (rol Distribuidor), forzar su valor.
    if (lockedReseller && init.Reseller !== undefined) {
      init.Reseller = lockedReseller;
    }
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setValue(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(values);
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
            {editable.map((f) => {
              const full = f.type === 17 || f.type === 4;
              const disabled =
                f.name === "Reseller" && Boolean(lockedReseller);
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
