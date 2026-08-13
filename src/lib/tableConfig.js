// Configuración de módulos de datos y de la navegación (menús).

export const FORM_URLS = {
  reportes: "",
  clientes: "",
  demostraciones: "",
  personal: "",
};

// Config por tabla (usada por DataModule).
export const MODULE_CONFIG = {
  reportes: {
    key: "reportes",
    label: "Reportes Semanales",
    resellerField: "Reseller",
    formUrl: FORM_URLS.reportes,
    // El Distribuidor puede REGISTRAR (crear) de su reseller. Editar/borrar = solo Admin.
    distributorCan: { create: true },
    listColumns: [
      "Reseller",
      "Semana desde",
      "Semana hasta",
      "Semana reportada",
      "Demostraciones realizadas",
      "Expos/Ferias participadas",
      "Potenciales contactados",
      "Potenciales cotizados",
    ],
  },
  clientes: {
    key: "clientes",
    label: "Usuario Final",
    resellerField: "Reseller",
    formUrl: FORM_URLS.clientes,
    distributorCan: { create: true },
    listColumns: [
      "Nombre de cliente final",
      "Reseller",
      "SN en caja",
      "SN Dron",
      "Modelo",
      "País",
      "Carta Compromiso",
    ],
  },
  demostraciones: {
    key: "demostraciones",
    label: "Demostraciones",
    resellerField: "Reseller",
    formUrl: FORM_URLS.demostraciones,
    distributorCan: { create: true },
    listColumns: [
      "Nombre Dealer",
      "Reseller",
      "Departamento",
      "Ciudad",
      "Fecha de la Demo",
      "N° de participantes (clientes)",
      "N° de interesados",
      "Volumen de ventas",
      "Tipo de demo",
    ],
  },
  personal: {
    key: "personal",
    label: "Información del Reseller",
    resellerField: "Reseller",
    formUrl: FORM_URLS.personal,
    // El Distribuidor puede agregar y editar el personal de su sucursal. Borrar = solo Admin.
    distributorCan: { create: true, edit: true },
    // "Certificaciones" es un campo de texto que guarda una lista de
    // (certificación + N° de diploma). El formulario lo edita como filas.
    certField: "Certificaciones",
    listColumns: [
      "Reseller",
      "Nombre",
      "Apellido",
      "Cargo/Puesto",
      "Teléfono",
      "Email",
      "Foto",
    ],
  },
  documentos: {
    key: "documentos",
    label: "Documentos",
    resellerField: null,
    listColumns: ["Nombre", "Categoría", "Archivo", "Activo"],
    // Columnas de texto que contienen un link: se muestran como botón "Abrir".
    linkColumns: ["Archivo"],
  },
  usuarios: {
    key: "usuarios",
    label: "Usuarios",
    resellerField: null,
    adminOnly: true,
    listColumns: ["Nombre", "Email", "Rol", "Reseller", "Activo"],
  },
  resellers: {
    key: "resellers",
    label: "Resellers",
    resellerField: null,
    adminOnly: true,
    listColumns: ["Nombre del Reseller", "Activo"],
  },
};

// Navegación (pestañas superiores). Cada entrada define su "tipo" de contenido.
export const NAV = [
  { type: "dashboard", key: "inicio", label: "Menú Principal" },
  { type: "data", key: "demostraciones", label: "Demostraciones" },
  {
    type: "group",
    key: "reportes",
    label: "Reportes",
    tabs: [
      { type: "data", key: "reportes", label: "Semanal" },
      { type: "mensual", key: "mensual", label: "Mensual" },
    ],
  },
  { type: "data", key: "clientes", label: "Usuario Final" },
  { type: "data", key: "personal", label: "Información del Reseller" },
  { type: "documentos", key: "documentos", label: "Documentos" },
  { type: "data", key: "usuarios", label: "Usuarios", adminOnly: true },
  { type: "data", key: "resellers", label: "Resellers", adminOnly: true },
];
