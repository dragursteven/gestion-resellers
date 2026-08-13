// /api/records?table=KEY
//   GET                         -> lista de registros
//   POST     { fields }         -> crear (solo Admin)
//   PUT   ?id=...  { fields }   -> editar (solo Admin)
//   DELETE ?id=...              -> borrar (solo Admin)
//
// El rol se pasa en el header "x-user-rol". Las escrituras exigen Admin.
import {
  lark,
  appToken,
  tableId,
  getFields,
  toLarkFields,
  readBody,
  sendError,
} from "./_lark.js";

function getParam(req, name) {
  if (req.query && req.query[name] != null) return req.query[name];
  return new URL(req.url, "http://x").searchParams.get(name);
}

// Qué puede hacer el rol Distribuidor (siempre solo de su propio reseller).
// Crear: Reportes, Demostraciones, Usuario Final y Personal.
// Editar: solo Personal (Información del Reseller). Borrar: nunca.
const DIST_CREATE = new Set(["reportes", "demostraciones", "clientes", "personal"]);
const DIST_EDIT = new Set(["personal"]);

function getRol(req) {
  return String(req.headers["x-user-rol"] || "").toLowerCase();
}
function getReseller(req) {
  try {
    return decodeURIComponent(String(req.headers["x-user-reseller"] || ""));
  } catch {
    return "";
  }
}

function requireAdmin(req, res) {
  if (getRol(req) !== "admin") {
    res.status(403).json({ ok: false, error: "Solo el rol Admin puede modificar" });
    return false;
  }
  return true;
}

// Autoriza una escritura. action = "create" | "edit".
// Admin siempre. Distribuidor según los sets, y forzando su propio Reseller.
function authorizeWrite(req, res, key, body, action) {
  const rol = getRol(req);
  if (rol === "admin") return true;
  if (rol === "distribuidor") {
    const allowed = action === "create" ? DIST_CREATE.has(key) : DIST_EDIT.has(key);
    if (!allowed) {
      res.status(403).json({ ok: false, error: "No autorizado para esta acción" });
      return false;
    }
    const reseller = getReseller(req);
    if (!reseller) {
      res.status(403).json({ ok: false, error: "Reseller no identificado" });
      return false;
    }
    body.fields = body.fields || {};
    body.fields.Reseller = reseller; // no puede escribir para otro reseller
    return true;
  }
  res.status(403).json({ ok: false, error: "No autorizado para esta acción" });
  return false;
}

export default async function handler(req, res) {
  try {
    const key = getParam(req, "table");
    if (!key) return res.status(400).json({ ok: false, error: "Falta ?table" });
    const id = tableId(key);
    const base = `/open-apis/bitable/v1/apps/${appToken()}/tables/${id}/records`;

    if (req.method === "GET") {
      const items = [];
      let pageToken = "";
      do {
        const q = new URLSearchParams({ page_size: "200" });
        if (pageToken) q.set("page_token", pageToken);
        const data = await lark(`${base}?${q}`);
        items.push(...(data.items || []));
        pageToken = data.has_more ? data.page_token : "";
      } while (pageToken);
      return res
        .status(200)
        .json({ ok: true, records: items.map((r) => ({ id: r.record_id, fields: r.fields })) });
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      if (!authorizeWrite(req, res, key, body, "create")) return;
      const meta = await getFields(key);
      const fields = toLarkFields(meta, body.fields);
      const data = await lark(base, {
        method: "POST",
        body: JSON.stringify({ fields }),
      });
      return res.status(200).json({ ok: true, record: data.record });
    }

    if (req.method === "PUT") {
      const rid = getParam(req, "id");
      if (!rid) return res.status(400).json({ ok: false, error: "Falta ?id" });
      const body = await readBody(req);
      if (!authorizeWrite(req, res, key, body, "edit")) return;
      const meta = await getFields(key);
      const fields = toLarkFields(meta, body.fields);
      const data = await lark(`${base}/${rid}`, {
        method: "PUT",
        body: JSON.stringify({ fields }),
      });
      return res.status(200).json({ ok: true, record: data.record });
    }

    if (req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const rid = getParam(req, "id");
      if (!rid) return res.status(400).json({ ok: false, error: "Falta ?id" });
      await lark(`${base}/${rid}`, { method: "DELETE" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, error: "Método no permitido" });
  } catch (err) {
    sendError(res, err);
  }
}
