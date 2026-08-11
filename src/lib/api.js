// Cliente HTTP hacia las funciones /api. Incluye el rol del usuario en el header
// para que el backend pueda exigir Admin en las escrituras.

function currentRol() {
  try {
    const u = JSON.parse(localStorage.getItem("gr_user") || "null");
    return u?.rol || "";
  } catch {
    return "";
  }
}

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-user-rol": currentRol(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = { ok: false, error: `Respuesta no válida (${res.status})` };
  }
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/login", { method: "POST", body: { email, password } }),

  fields: (table) => request(`/api/fields?table=${encodeURIComponent(table)}`),

  list: (table) => request(`/api/records?table=${encodeURIComponent(table)}`),

  create: (table, fields) =>
    request(`/api/records?table=${encodeURIComponent(table)}`, {
      method: "POST",
      body: { fields },
    }),

  update: (table, id, fields) =>
    request(
      `/api/records?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`,
      { method: "PUT", body: { fields } }
    ),

  remove: (table, id) =>
    request(
      `/api/records?table=${encodeURIComponent(table)}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" }
    ),

  upload: (name, contentBase64) =>
    request("/api/upload", { method: "POST", body: { name, contentBase64 } }),

  mediaUrl: (fileToken) => `/api/media?token=${encodeURIComponent(fileToken)}`,
};
