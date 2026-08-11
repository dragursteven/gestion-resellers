// POST /api/upload  { name, contentBase64 }  (solo Admin)
// Sube un archivo a Lark Drive y devuelve { file_token } para usar en un campo Adjunto.
import { getToken, appToken, DOMAIN, readBody, sendError } from "./_lark.js";

export const config = {
  api: { bodyParser: { sizeLimit: "25mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }
  if (String(req.headers["x-user-rol"] || "").toLowerCase() !== "admin") {
    return res.status(403).json({ ok: false, error: "Solo el rol Admin puede subir archivos" });
  }
  try {
    const { name, contentBase64 } = await readBody(req);
    if (!name || !contentBase64) {
      return res.status(400).json({ ok: false, error: "Falta name o contentBase64" });
    }
    const b64 = String(contentBase64).includes(",")
      ? String(contentBase64).split(",")[1]
      : String(contentBase64);
    const bytes = Buffer.from(b64, "base64");

    const form = new FormData();
    form.append("file_name", String(name));
    form.append("parent_type", "bitable_file");
    form.append("parent_node", appToken());
    form.append("size", String(bytes.length));
    form.append("file", new Blob([bytes]), String(name));

    const at = await getToken();
    const resp = await fetch(`${DOMAIN}/open-apis/drive/v1/medias/upload_all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${at}` },
      body: form,
    });
    const data = await resp.json();
    if (data.code !== 0) {
      return res.status(500).json({ ok: false, error: `Upload Lark: ${data.code} ${data.msg}` });
    }
    return res.status(200).json({ ok: true, file_token: data.data.file_token });
  } catch (err) {
    sendError(res, err);
  }
}
