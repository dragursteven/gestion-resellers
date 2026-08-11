# Instructivo de publicación — Gestión de Resellers (para no técnicos)

Objetivo: subir la app a internet en una dirección `https://...vercel.app`.
Todo se hace desde el navegador, sin instalar programas. Tiempo estimado: 20–30 min.

Vas a usar dos servicios gratuitos:
- **GitHub** — guarda el código.
- **Vercel** — publica la app y ejecuta las funciones que hablan con Lark.

---

## Paso 1 — Tener la carpeta del proyecto

Ya tenés la carpeta **`gestion-resellers`** (la que acompaña este instructivo).
No la modifiques. Solo asegurate de tenerla ubicada y de recordar dónde está.

---

## Paso 2 — Crear cuenta en GitHub y subir el código

1. Entrá a **https://github.com** y creá una cuenta (o iniciá sesión).
2. Arriba a la derecha, clic en **+** → **New repository**.
   - Repository name: `gestion-resellers`
   - Dejá **Private** (privado).
   - **No** marques "Add a README".
   - Clic en **Create repository**.
3. En la página que aparece, buscá el link azul que dice
   **"uploading an existing file"** (subir un archivo existente) y hacé clic.
4. Abrí la carpeta `gestion-resellers` en tu computadora, **seleccioná todo lo de adentro**
   (todos los archivos y subcarpetas) y **arrastralo** a la ventana de GitHub.
   - Importante: subí el **contenido** de la carpeta, no la carpeta comprimida.
5. Abajo, clic en **Commit changes**. Esperá a que termine de subir.

> Si te resulta más cómodo, podés instalar **GitHub Desktop** (https://desktop.github.com)
> y arrastrar la carpeta ahí; es opcional.

---

## Paso 3 — Publicar en Vercel

1. Entrá a **https://vercel.com** y hacé **Sign Up** eligiendo **Continue with GitHub**
   (así quedan conectados).
2. En el panel de Vercel, clic en **Add New… → Project**.
3. Va a aparecer tu repositorio `gestion-resellers`. Clic en **Import**.
4. **No cambies nada** de Framework/Build (Vercel detecta Vite solo).
5. Antes de dar Deploy, abrí la sección **Environment Variables** y cargá estas
   (Name = nombre, Value = valor). Copiá exactamente:

   | Name | Value |
   |---|---|
   | `LARK_APP_ID` | cli_aaf1f7ccefe1ded4 |
   | `LARK_APP_SECRET` | (tu App Secret) |
   | `LARK_BASE_APP_TOKEN` | Xue1boV9AazaxhsZy6Pl7TJLgDc |
   | `TABLE_RESELLERS` | tblhiGDdjONGq5Zl |
   | `TABLE_USUARIOS` | tblHJ1B62ZW4z1Hk |
   | `TABLE_REPORTES_SEMANALES` | tblIFXIX48ikl3rs |
   | `TABLE_CLIENTES_FINALES` | tblXTqJgLSzV7CcF |
   | `TABLE_DEMOSTRACIONES` | tblQtjuGEyRitw6z |

   Por cada fila: escribís el Name, pegás el Value, y clic en **Add**.

6. Clic en **Deploy** y esperá 1–2 minutos.
7. Cuando termine, Vercel te da un botón **Visit** y una dirección
   tipo `https://gestion-resellers-xxxx.vercel.app`. **Esa es tu app.**

---

## Paso 4 — Primer ingreso

1. En Lark, en la tabla **Usuarios**, asegurate de tener al menos un usuario con:
   - Rol = **Admin**, Activo = tildado, y un Email + Contraseña que recuerdes.
2. Abrí la dirección `...vercel.app`, ingresá ese Email y Contraseña.
3. Deberías ver las pestañas y los datos. Listo.

---

## Paso 5 — Cargar los links de los Formularios (cuando los tengas)

Los botones **"Cargar (Formulario)"** aparecen cuando pegás los links de los
Formularios de Lark. Para hacerlo:

1. En GitHub, abrí el archivo **`src/lib/tableConfig.js`**.
2. Clic en el lápiz (**Edit**) y completá dentro de `FORM_URLS` los links entre comillas:

   ```js
   export const FORM_URLS = {
     reportes: "https://tu-link-del-formulario-de-reportes",
     clientes: "https://tu-link-de-clientes",
     demostraciones: "https://tu-link-de-demostraciones",
   };
   ```

3. Clic en **Commit changes**. Vercel vuelve a publicar solo, en 1–2 minutos.

---

## Cómo hacer cambios más adelante

Cualquier cambio en los archivos (desde GitHub, con el lápiz) se publica **automáticamente**
en Vercel. No hay que volver a configurar nada.

## Problemas frecuentes

- **"Credenciales inválidas":** revisá que el usuario en la tabla Usuarios tenga
  **Activo** tildado y que Email/Contraseña coincidan.
- **Pantalla de error / no cargan datos:** casi siempre es una variable de entorno mal
  escrita. En Vercel → Settings → Environment Variables, revisá los valores y luego
  **Deployments → Redeploy**.
- **No aparece el botón Cargar:** falta pegar el link del formulario (Paso 5).
- **Los adjuntos no abren:** confirmá que la App de Lark tenga el permiso de Drive
  (`drive:drive`) y que publicaste una versión de la app.
