// GET /api/media?token=FILE_TOKEN  -> sirve el adjunto/imagen desde Lark Drive.
// Actúa de puente para no exponer el tenant_access_token en el navegador.
import { getToken, DOMAIN, sendError } from "./_lark.js";

export default async function handler(req, res) {
  try {
    const token =
      req.query?.token || new URL(req.url, "http://x").searchParams.get("token");
    if (!token) return res.status(400).json({ ok: false, error: "Falta ?token" });

    const at = await getToken();
    const upstream = await fetch(
      `${DOMAIN}/open-apis/drive/v1/medias/${encodeURIComponent(token)}/download`,
      { headers: { Authorization: `Bearer ${at}` } }
    );

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ ok: false, error: `No se pudo obtener el archivo (${upstream.status})` });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=300");

    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch (err) {
    sendError(res, err);
  }
}
