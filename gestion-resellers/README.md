# Gestión de Resellers · DRAGUR

Web app interna para gestionar los datos de los resellers de DRAGUR, con datos en
**Lark Base (Bitable)**. Frontend en **React + Vite + Tailwind** (tema Modernist) y
backend en **funciones serverless de Vercel** (`/api`).

## Módulos

- **Reportes Semanales** — compras/ventas/stock por modelo (T100DB, T100, T70P, T55, T50, T40) y métricas.
- **Clientes Finales** — datos del cliente + Carta Compromiso (adjunto).
- **Demostraciones** — datos de la demo + hasta 11 imágenes.
- **Usuarios** (solo Admin) — alta/baja de usuarios y roles.
- **Resellers** (solo Admin) — alta/baja de resellers.

## Roles

- **Admin (DRAGUR):** ve todos los resellers, crea/edita/borra en todos los módulos.
- **Distribuidor:** ve solo su reseller en modo lectura; carga datos mediante los
  **Formularios de Lark** (botón "Cargar").

## Arquitectura

- El backend lee la **metadata de campos** de cada tabla y convierte los valores según
  el **tipo real** de columna (texto, número, fecha, selección, casilla, adjunto).
- `/api/media` sirve los adjuntos sin exponer el token de Lark.
- El frontend arma las listas y formularios de forma **dinámica** a partir de esa metadata,
  con pequeñas configuraciones por módulo en `src/lib/tableConfig.js`.

## Desarrollo local

```bash
npm install
# crear un archivo .env con las variables (ver .env.example)
npm run dev
```

> En local, las funciones `/api` se ejecutan con `vercel dev` (recomendado) o desplegando
> a Vercel. Con `npm run dev` solo corre el frontend.

## Variables de entorno (Vercel)

Ver `.env.example`. Todas van en **Project Settings → Environment Variables**:

`LARK_APP_ID`, `LARK_APP_SECRET`, `LARK_BASE_APP_TOKEN`,
`TABLE_RESELLERS`, `TABLE_USUARIOS`, `TABLE_REPORTES_SEMANALES`,
`TABLE_CLIENTES_FINALES`, `TABLE_DEMOSTRACIONES`,
`LARK_DOMAIN` (opcional; por defecto `https://open.larksuite.com`).

## Links de formularios

Cuando tengas los links de los Formularios de Lark, cargalos en
`src/lib/tableConfig.js` (objeto `FORM_URLS`). Si quedan vacíos, el botón "Cargar"
no aparece.

## Publicar

Ver `INSTRUCTIVO_Despliegue.md` (paso a paso, sin conocimientos técnicos).
