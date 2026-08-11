import React, { useState } from "react";
import { Paperclip, X, Loader2, ExternalLink } from "lucide-react";
import { api } from "../lib/api.js";
import { toDateInput } from "../lib/format.js";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Un único campo de formulario, renderizado según el TIPO REAL del campo en Lark.
export default function Field({ field, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const { name, type, options = [] } = field;

  if (type === 2) {
    return (
      <input
        type="number"
        className="field-input"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    );
  }

  if (type === 3) {
    return (
      <select
        className="field-input"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Seleccionar —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  if (type === 4) {
    const arr = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const checked = arr.includes(o);
          return (
            <label
              key={o}
              className={
                "px-3 py-1 text-sm border cursor-pointer " +
                (checked
                  ? "bg-green text-white border-green"
                  : "bg-white border-line text-ink")
              }
            >
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={() =>
                  onChange(
                    checked ? arr.filter((x) => x !== o) : [...arr, o]
                  )
                }
              />
              {o}
            </label>
          );
        })}
      </div>
    );
  }

  if (type === 5) {
    return (
      <input
        type="date"
        className="field-input"
        value={toDateInput(value) || (typeof value === "string" ? value : "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (type === 7) {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-ink">Sí</span>
      </label>
    );
  }

  if (type === 17) {
    const arr = Array.isArray(value) ? value : [];

    async function onPick(e) {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploadError("");
      setUploading(true);
      try {
        const b64 = await fileToBase64(file);
        const res = await api.upload(file.name, b64);
        onChange([...arr, { file_token: res.file_token, name: file.name }]);
      } catch (err) {
        setUploadError(String(err.message || "No se pudo subir"));
      } finally {
        setUploading(false);
      }
    }

    return (
      <div>
        <div className="space-y-1 mb-2">
          {arr.map((a, i) => (
            <div
              key={a.file_token || i}
              className="flex items-center justify-between border border-line px-2 py-1 text-sm bg-white"
            >
              <span className="flex items-center gap-2 truncate">
                <Paperclip size={14} className="text-muted" />
                {a.file_token ? (
                  <a
                    href={api.mediaUrl(a.file_token)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green hover:underline flex items-center gap-1"
                  >
                    {a.name || "archivo"} <ExternalLink size={12} />
                  </a>
                ) : (
                  <span>{a.name || "archivo"}</span>
                )}
              </span>
              <button
                type="button"
                className="text-muted hover:text-red-600"
                onClick={() => onChange(arr.filter((_, j) => j !== i))}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <label className="btn-ghost cursor-pointer">
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Paperclip size={16} />
          )}
          Adjuntar archivo
          <input
            type="file"
            className="hidden"
            onChange={onPick}
            disabled={uploading}
          />
        </label>
        {uploadError ? (
          <p className="text-xs text-red-600 mt-1">{uploadError}</p>
        ) : null}
      </div>
    );
  }

  // Texto y otros
  return (
    <input
      type="text"
      className="field-input"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
