# Instructivo — Tablas nuevas (Personal y Documentos)

Estas dos tablas se agregan al **mismo Base** de Lark que ya venís usando. Al final,
cargás 2 variables nuevas en Vercel. No se toca nada de las tablas anteriores.

> Recordá: los campos "obligatorios" se marcan en el **Formulario** de Lark, no en la tabla.

---

## Tabla A — `Personal`  (módulo "Información del Reseller")

Creá una tabla nueva en el Base, llamada **Personal**, con estas columnas:

| Columna | Tipo de campo | Notas |
|---|---|---|
| Nombre | Texto | Primera columna |
| Apellido | Texto | |
| Reseller | Selección única | Opciones: los 6 resellers (ver abajo) |
| Teléfono | Texto | |
| Email | Texto | |
| Fecha de Nacimiento | Fecha | |
| Foto | Adjunto (Attachment) | Foto de la persona |
| Cargo/Puesto | Selección única | Opciones: `Técnico`, `Comercial` |
| Certificaciones | Texto (largo) | Lo llena la app (ver nota) |

Opciones del campo **Reseller**: `DRAGUR`, `Drones del Pampa`, `Drones Orientales`,
`Javier Bruchou`, `Rotech`, `J Hartwich`.

> El nombre de la columna **Cargo/Puesto** debe escribirse exactamente así (con la barra).

> **Certificaciones:** ya no hace falta una columna aparte de "Código de Diploma". En la app,
> cada empleado puede tener **varias certificaciones**, y a cada una le cargás su número de
> diploma. Todo eso se guarda dentro del campo de texto **Certificaciones** (una por línea,
> con el formato `Certificación | N° de diploma`). No necesitás escribir nada a mano en Lark:
> lo edita el formulario de la app.

Copiá el **table_id** (tbl...) de esta tabla.

---

## Tabla B — `Documentos`  (plantillas globales)

Creá otra tabla llamada **Documentos**, con estas columnas:

| Columna | Tipo de campo | Notas |
|---|---|---|
| Nombre | Texto | Primera columna |
| Categoría | Selección única | Opciones: `Manual de distribuidor autorizado`, `Checklist demostraciones exclusivas`, `Checklist entrega técnica`, `Otro` |
| Archivo | Texto | **El link (URL) al archivo ya subido en Lark** |
| Activo | Casilla (Checkbox) | |

Estos documentos son **globales** (los ven todos los resellers). En la columna **Archivo**
pegás el **link** del archivo que ya tenés en Lark. En la app, cada documento muestra un
botón **Abrir** que lleva directo a ese link. El Distribuidor solo los ve; el Admin puede
crear/editar.

> Para obtener el link en Lark: abrí el archivo/documento, usá la opción **Compartir /
> Copiar enlace**, y pegá esa URL en la columna Archivo. Verificá que el enlace tenga
> permiso de acceso para quienes van a usar la app.

Copiá el **table_id** (tbl...) de esta tabla.

---

## Variables nuevas en Vercel

En Vercel → tu proyecto → **Settings → Environment Variables**, agregá estas dos y luego
hacé **Redeploy** (Deployments → botón "…" → Redeploy):

```
TABLE_PERSONAL    = tbl... (el de la tabla Personal)
TABLE_DOCUMENTOS  = tbl... (el de la tabla Documentos)
```

---

## Notas sobre el resto de las funciones nuevas

- **Menú Principal:** las métricas (Ventas = drones vendidos, Reportes, Usuarios Finales,
  Demos) se calculan solas desde los datos que ya cargás. El filtro "Mes actual" usa la
  fecha de cada registro (Semana desde en Reportes, Fecha de la Demo en Demostraciones).
- **Reportes → Mensual:** no necesita tabla nueva; se calcula sumando los Reportes
  Semanales por mes y se puede exportar a Excel.
- **Metas:** quedan para una versión próxima (ya está el espacio reservado en el Menú
  Principal).
