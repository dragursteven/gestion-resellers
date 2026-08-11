// Configuración de cada módulo/pestaña.
//
// - key: clave lógica de la tabla (coincide con el backend)
// - label: nombre de la pestaña
// - resellerField: nombre de la columna que identifica el Reseller (para filtrar).
//     null si la tabla no se filtra por reseller (ej: la propia tabla Resellers).
// - listColumns: columnas a mostrar en la lista. Si es null, se muestran todas.
// - adminOnly: si true, la pestaña solo aparece para el rol Admin.
// - formUrl: link del Formulario de Lark para el botón "Cargar".
//     Dejalo vacío ("") hasta tener el link; el botón se oculta si está vacío.

export const FORM_URLS = {
  reportes: "",
  clientes: "",
  demostraciones: "",
};

export const MODULES = [
  {
    key: "reportes",
    label: "Reportes Semanales",
    resellerField: "Reseller",
    formUrl: FORM_URLS.reportes,
    // La lista muestra un resumen limpio. El detalle completo (incluidos los
    // modelos) se ve con el botón "Ver". La exportación a Excel incluye TODO.
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
  {
    key: "clientes",
    label: "Clientes Finales",
    resellerField: "Reseller",
    formUrl: FORM_URLS.clientes,
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
  {
    key: "demostraciones",
    label: "Demostraciones",
    resellerField: "Reseller",
    formUrl: FORM_URLS.demostraciones,
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
  {
    key: "usuarios",
    label: "Usuarios",
    resellerField: null,
    adminOnly: true,
    listColumns: ["Nombre", "Email", "Rol", "Reseller", "Activo"],
  },
  {
    key: "resellers",
    label: "Resellers",
    resellerField: null,
    adminOnly: true,
    listColumns: ["Nombre del Reseller", "Activo"],
  },
];
