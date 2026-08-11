// POST /api/login  { email, password }
// Valida contra la tabla Usuarios de Lark. Devuelve datos del usuario (sin contraseña).
import { lark, appToken, tableId, readBody, sendError } from "./_lark.js";

const F = {
  email: "Email",
  password: "Contraseña",
  nombre: "Nombre",
  rol: "Rol",
  reseller: "Reseller",
  activo: "Activo",
};

function pickText(v) {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map((x) => x?.text ?? x).join(", ");
  if (typeof v === "object") return v.text ?? "";
  return String(v);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }
  try {
    const { email, password } = await readBody(req);
    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, error: "Email y contraseña requeridos" });
    }

    const id = tableId("usuarios");
    const items = [];
    let pageToken = "";
    do {
      const q = new URLSearchParams({ page_size: "200" });
      if (pageToken) q.set("page_token", pageToken);
      const data = await lark(
        `/open-apis/bitable/v1/apps/${appToken()}/tables/${id}/records?${q}`
      );
      items.push(...(data.items || []));
      pageToken = data.has_more ? data.page_token : "";
    } while (pageToken);

    const target = String(email).trim().toLowerCase();
    const match = items.find((r) => {
      const f = r.fields || {};
      const em = pickText(f[F.email]).trim().toLowerCase();
      const pw = pickText(f[F.password]);
      const activo = f[F.activo] === true;
      return em === target && pw === String(password) && activo;
    });

    if (!match) {
      return res
        .status(401)
        .json({ ok: false, error: "Credenciales inválidas o usuario inactivo" });
    }

    const f = match.fields || {};
    return res.status(200).json({
      ok: true,
      user: {
        id: match.record_id,
        nombre: pickText(f[F.nombre]),
        email: pickText(f[F.email]),
        rol: pickText(f[F.rol]) || "Distribuidor",
        reseller: pickText(f[F.reseller]),
      },
    });
  } catch (err) {
    sendError(res, err);
  }
}
