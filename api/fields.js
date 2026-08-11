// GET /api/fields?table=KEY  -> metadata de campos (nombre, tipo, opciones)
import { getFields, sendError } from "./_lark.js";

export default async function handler(req, res) {
  try {
    const key = req.query?.table || new URL(req.url, "http://x").searchParams.get("table");
    if (!key) return res.status(400).json({ ok: false, error: "Falta ?table" });

    const items = await getFields(key);
    const fields = items.map((f) => ({
      name: f.field_name,
      type: f.type,
      options: (f.property?.options || []).map((o) => o.name),
    }));
    res.status(200).json({ ok: true, fields });
  } catch (err) {
    sendError(res, err);
  }
}
