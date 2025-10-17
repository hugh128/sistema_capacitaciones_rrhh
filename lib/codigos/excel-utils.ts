import ExcelJS from "exceljs"
import type { CodigoPadre } from "./types"

type ExportRow = {
  DEPARTAMENTO_CODIGO: string;
  CODIGO: string;
  TIPO_DOCUMENTO: string;
  NOMBRE_DOCUMENTO: string;
  VERSION_PADRE: number;
  APROBACION_PADRE: string;
  DATO_ASOCIADO: string;
  NOMBRE_DOC_ASOCIADO: string;
  VERSION_HIJO: number;
  APROBACION_HIJO: string;
  ESTATUS_HIJO: string;
};

function excelDateToISOString(cellValue: ExcelJS.CellValue | undefined): string {
  if (!cellValue) {
    return '';
  }

  let date: Date | null = null;

  if (cellValue instanceof Date) {
    date = cellValue;
  } else if (typeof cellValue === 'number' && cellValue > 1) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    date = new Date(excelEpoch.getTime() + (cellValue - 1) * 24 * 60 * 60 * 1000);
  } else if (typeof cellValue === 'string') {
    const parsedDate = new Date(cellValue);
    if (!isNaN(parsedDate.getTime())) {
      date = parsedDate;
    }
  }
  
  if (date && !isNaN(date.getTime())) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  return '';
}


/* const mapStatusToBoolean = (estatusText: string): boolean => {
  return estatusText?.toUpperCase() === "VIGENTE";
};
 */
export async function importFromExcel(file: File): Promise<CodigoPadre[]> {
  const workbook = new ExcelJS.Workbook();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
/*     if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      await workbook.csv.read(new Uint8Array(arrayBuffer) as any);
    } else {
      await workbook.xlsx.load(arrayBuffer);
    } */

    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      throw new Error("El archivo con formato CSV no es aceptado. Por favor, asegúrate de cargar un archivo en formato Excel (.xlsx).");
    } else {
      await workbook.xlsx.load(arrayBuffer);
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("No se encontró la hoja de trabajo en el archivo.");
    }

    const parentMap: Map<string, Omit<CodigoPadre, 'ID_DOCUMENTO'>> = new Map();

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const parentDepartment = row.getCell(1).value?.toString().trim() || '';
      const parentCodigo = row.getCell(2).value?.toString().trim() || '';
      const tipoDocumento = row.getCell(3).value?.toString().trim() || '';
      const nombreDocumento = row.getCell(4).value?.toString().trim() || '';
      const parentVersion = Number(row.getCell(5).value?.toString().trim() || 0);

      const parentApproval = row.getCell(6).value?.toString().trim() || '';
      const parentApprovalISO = excelDateToISOString(parentApproval);

      const childCodigo = row.getCell(7).value?.toString().trim() || '';
      const childNombreDocumento = row.getCell(8).value?.toString().trim() || '';
      const childVersion = Number(row.getCell(9).value?.toString().trim() || 0);
      
      const rawAprobacionValue = row.getCell(10).value;
      
      const childApprovalISO = excelDateToISOString(rawAprobacionValue);

      const estatusAso = row.getCell(11).value?.toString().trim() || ''; 
      
      if (!parentCodigo) {
        return;
      }
      
      let parentData = parentMap.get(parentCodigo);

      if (!parentData) {
        parentData = {
          DEPARTAMENTO_CODIGO: parentDepartment,
          CODIGO: parentCodigo,
          TIPO_DOCUMENTO: tipoDocumento,
          NOMBRE_DOCUMENTO: nombreDocumento,
          VERSION: parentVersion,
          APROBACION: parentApprovalISO,
          ESTATUS: estatusAso,
          DOCUMENTOS_ASOCIADOS: [],
        };
        parentMap.set(parentCodigo, parentData);
      }
      
      if (childCodigo && childNombreDocumento) {
        const isDuplicate = parentData.DOCUMENTOS_ASOCIADOS.some(
          (child) => child.CODIGO === childCodigo
        );

        if (!isDuplicate) {
          parentData.DOCUMENTOS_ASOCIADOS.push({
            ID_DOC_ASOCIADO: 0,
            CODIGO: childCodigo,
            NOMBRE_DOCUMENTO: childNombreDocumento,
            FECHA_APROBACION: childApprovalISO,
            VERSION: childVersion,
            ESTATUS: estatusAso,
            DOCUMENTO_ID: 0,
          });
        }
      }
    });

    return Array.from(parentMap.values()).map(data => ({
      ...data,
      ID_DOCUMENTO: 0,
    }) as CodigoPadre);

  } catch (error) {
    console.error("Error al importar el archivo Excel/CSV:", error);
    throw new Error(`Error al procesar el archivo: ${error instanceof Error ? error.message : "Formato inválido"}`);
  }
}

export async function exportToExcel(codigos: CodigoPadre[], filename = "CodigosAsociados.xlsx") {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Códigos Asociados");

  worksheet.columns = [
    { header: "Código Departamento", key: "DEPARTAMENTO_CODIGO", width: 15 },
    { header: "Código", key: "CODIGO", width: 15 },
    { header: "Tipo de Documento", key: "TIPO_DOCUMENTO", width: 25 },
    { header: "Documento", key: "NOMBRE_DOCUMENTO", width: 40 },
    { header: "Version Cod Padre", key: "VERSION_PADRE", width: 15 },
    { header: "Aprobación Cód. P", key: "APROBACION_PADRE", width: 20 },
    { header: "Doc.Asociado", key: "DATO_ASOCIADO", width: 15 },
    { header: "Nombre de Documento Asociado", key: "NOMBRE_DOC_ASOCIADO", width: 40 },
    { header: "Versión Asociado", key: "VERSION_HIJO", width: 15 },
    { header: "Aprobación", key: "APROBACION_HIJO", width: 20 },
    { header: "Estatus Aso.", key: "ESTATUS_HIJO", width: 15 },
  ];

  const exportData: ExportRow[] = [];

  codigos.forEach((parent) => {    
    if (parent.DOCUMENTOS_ASOCIADOS.length === 0) {
      exportData.push({
        DEPARTAMENTO_CODIGO: parent.DEPARTAMENTO_CODIGO,
        CODIGO: parent.CODIGO,
        TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
        NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
        VERSION_PADRE: parent.VERSION,
        APROBACION_PADRE: parent.APROBACION,
        DATO_ASOCIADO: "",
        NOMBRE_DOC_ASOCIADO: "",
        VERSION_HIJO: 0,
        APROBACION_HIJO: "",
        ESTATUS_HIJO: ""
      });
    } else {
      parent.DOCUMENTOS_ASOCIADOS.forEach((child) => {
        exportData.push({
        DEPARTAMENTO_CODIGO: parent.DEPARTAMENTO_CODIGO,
        CODIGO: parent.CODIGO,
        TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
        NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
        VERSION_PADRE: parent.VERSION,
        APROBACION_PADRE: parent.APROBACION,
        DATO_ASOCIADO: child.CODIGO,
        NOMBRE_DOC_ASOCIADO: child.NOMBRE_DOCUMENTO,
        VERSION_HIJO: child.VERSION,
        APROBACION_HIJO: child.FECHA_APROBACION,
        ESTATUS_HIJO: child.ESTATUS
        });
      });
    }
  });

  worksheet.addRows(exportData);

  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
