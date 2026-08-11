import * as XLSX from "xlsx";
import { exportValue } from "./format.js";

// Exporta filas seleccionadas a un archivo .xlsx.
// columns: [{ name }]  fieldTypes: Map name->type
export function exportToExcel(fileName, columns, rows, fieldTypes) {
  const data = rows.map((row) => {
    const obj = {};
    for (const col of columns) {
      obj[col] = exportValue(row.fields?.[col], fieldTypes.get(col) || 1);
    }
    return obj;
  });

  const ws = XLSX.utils.json_to_sheet(data, { header: columns });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
