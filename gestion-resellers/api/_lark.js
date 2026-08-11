// Utilidades compartidas para hablar con la API de Lark Base (Bitable).
// No es una ruta (empieza con "_"), solo se importa desde las demás funciones.

const DOMAIN = process.env.LARK_DOMAIN || "https://open.larksuite.com";

// Mapeo de "clave lógica" -> variable de entorno con el table_id.
const TABLE_ENV = {
  resellers: "TABLE_RESELLERS",
  usuarios: "TABLE_USUARIOS",
  reportes: "TABLE_REPORTES_SEMANALES",
  clientes: "TABLE_CLIENTES_FINALES",
  demostraciones: "TABLE_DEMOSTRACIONES",
};

export function tableId(key) {
  const env = TABLE_ENV[String(key || "")];
  if (!env) throw new Error(`Tabla desconocida: ${key}`);
  const id = process.env[env];
  if (!id) throw new Error(`Falta la variable de entorno ${env}`);
  return id;
}

export function appToken() {
  const t = process.env.LARK_BASE_APP_TOKEN;
  if (!t) throw new Error("Falta LARK_BASE_APP_TOKEN");
  return t;
}

// --- Token con cache en memoria (por instancia serverless) ---
let cachedToken = null;
let cachedExp = 0;

export async function getToken() {
  const now = Date.now();
  if (cachedToken && now < cachedExp - 60_000) return cachedToken;

  const res = await fetch(
    `${DOMAIN}/open-apis/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: process.env.LARK_APP_ID,
        app_secret: process.env.LARK_APP_SECRET,
      }),
    }
  );
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`Auth Lark falló: ${data.code} ${data.msg}`);
  }
  cachedToken = data.tenant_access_token;
  cachedExp = now + (data.expire || 7200) * 1000;
  return cachedToken;
}

export async function lark(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${DOMAIN}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`Lark ${path} -> ${data.code} ${data.msg}`);
  }
  return data.data;
}

// --- Metadata de campos (tipos reales) ---
const fieldsCache = new Map();

export async function getFields(key, { fresh = false } = {}) {
  const id = tableId(key);
  if (!fresh && fieldsCache.has(id)) return fieldsCache.get(id);

  const items = [];
  let pageToken = "";
  do {
    const q = new URLSearchParams({ page_size: "100" });
    if (pageToken) q.set("page_token", pageToken);
    const data = await lark(
      `/open-apis/bitable/v1/apps/${appToken()}/tables/${id}/fields?${q}`
    );
    items.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : "";
  } while (pageToken);

  fieldsCache.set(id, items);
  return items;
}

// Tipos de campo de Lark que NO se pueden escribir (solo lectura).
const READONLY_TYPES = new Set([
  19, // Lookup
  20, // Fórmula
  1001, // Fecha de creación
  1002, // Última modificación
  1003, // Creado por
  1004, // Modificado por
  1005, // Número automático
]);

// Convierte los valores del formulario al formato correcto según el TIPO REAL
// de cada columna en Lark. Ignora campos vacíos y de solo lectura.
export function toLarkFields(fieldsMeta, input) {
  const byName = new Map(fieldsMeta.map((f) => [f.field_name, f]));
  const out = {};

  for (const [name, rawValue] of Object.entries(input || {})) {
    const meta = byName.get(name);
    if (!meta) continue;
    if (READONLY_TYPES.has(meta.type)) continue;

    const value = rawValue;
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0);

    switch (meta.type) {
      case 1: // Texto
      case 15: // URL
      case 13: // Teléfono
        if (!empty) out[name] = String(value ?? "");
        break;
      case 2: {
        // Número
        if (!empty) {
          const n = Number(value);
          if (!Number.isNaN(n)) out[name] = n;
        }
        break;
      }
      case 3: // Selección única
        if (!empty) out[name] = String(value ?? "");
        break;
      case 4: // Selección múltiple
        if (!empty)
          out[name] = Array.isArray(value)
            ? value.map((v) => String(v))
            : [String(value)];
        break;
      case 5: {
        // Fecha/hora -> timestamp en ms
        if (!empty) {
          const ms =
            typeof value === "number" ? value : Date.parse(String(value));
          if (!Number.isNaN(ms)) out[name] = ms;
        }
        break;
      }
      case 7: // Casilla
        out[name] = value === true || value === "true" || value === 1;
        break;
      case 17: {
        // Adjuntos -> [{ file_token }]
        if (!empty) {
          const arr = Array.isArray(value) ? value : [value];
          out[name] = arr
            .map((v) => (typeof v === "string" ? { file_token: v } : v))
            .filter((v) => v && v.file_token);
        }
        break;
      }
      default:
        if (!empty) out[name] = value;
    }
  }
  return out;
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      // Vercel a veces ya parsea el body.
      return resolve(
        typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body
      );
    }
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export function sendError(res, err, status = 500) {
  console.error(err);
  res.status(status).json({ ok: false, error: String(err.message || err) });
}

export { DOMAIN };
