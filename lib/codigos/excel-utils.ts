import ExcelJS from "exceljs"
import type { CodigoPadre } from "./types"

type ExportRow = {
  CODIGO: string;
  TIPO_DOCUMENTO: string;
  NOMBRE_DOCUMENTO: string;
  APROBACION: string;
  ESTATUS_ASO: string;
  DATO_ASOCIADO: string;
  NOMBRE_DOC_ASOCIADO: string;
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


const mapStatusToBoolean = (estatusText: string): boolean => {
  return estatusText?.toUpperCase() === "VIGENTE";
};

export async function importFromExcel(file: File): Promise<CodigoPadre[]> {
  const workbook = new ExcelJS.Workbook();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      await workbook.csv.read(new Uint8Array(arrayBuffer) as any);
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

      const parentCodigo = row.getCell(1).value?.toString().trim() || '';
      const tipoDocumento = row.getCell(2).value?.toString().trim() || '';
      const nombreDocumento = row.getCell(3).value?.toString().trim() || '';
      const childCodigo = row.getCell(4).value?.toString().trim() || '';
      const childNombreDocumento = row.getCell(5).value?.toString().trim() || '';
      
      const rawAprobacionValue = row.getCell(6).value;
      
      const aprobacionISO = excelDateToISOString(rawAprobacionValue);

      const estatusAsoText = row.getCell(7).value?.toString().trim() || ''; 
      
      if (!parentCodigo) {
        return;
      }

      const estatusAsoBool = mapStatusToBoolean(estatusAsoText);
      
      let parentData = parentMap.get(parentCodigo);

      if (!parentData) {
        parentData = {
          CODIGO: parentCodigo,
          TIPO_DOCUMENTO: tipoDocumento,
          NOMBRE_DOCUMENTO: nombreDocumento,
          APROBACION: aprobacionISO,
          ESTATUS: mapStatusToBoolean(estatusAsoText), 
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
            ESTATUS: estatusAsoBool,
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
    { header: "Código", key: "CODIGO", width: 15 },
    { header: "Tipo de Documento", key: "TIPO_DOCUMENTO", width: 25 },
    { header: "Documento", key: "NOMBRE_DOCUMENTO", width: 40 },
    { header: "Doc.Asociado", key: "DATO_ASOCIADO", width: 15 },
    { header: "Nombre de Documento Asociado", key: "NOMBRE_DOC_ASOCIADO", width: 40 },
    { header: "Aprobación", key: "APROBACION", width: 20 },
    { header: "Estatus Aso.", key: "ESTATUS_ASO", width: 15 },
  ];

  const exportData: ExportRow[] = [];

  codigos.forEach((parent) => {
    const estatusText = parent.ESTATUS ? "VIGENTE" : "INACTIVO";
    
    if (parent.DOCUMENTOS_ASOCIADOS.length === 0) {
      exportData.push({
        CODIGO: parent.CODIGO,
        TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
        NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
        APROBACION: parent.APROBACION,
        ESTATUS_ASO: estatusText,
        DATO_ASOCIADO: "",
        NOMBRE_DOC_ASOCIADO: "",
      });
    } else {
      parent.DOCUMENTOS_ASOCIADOS.forEach((child) => {
        const childEstatusText = child.ESTATUS ? "VIGENTE" : "INACTIVO";
        exportData.push({
          CODIGO: parent.CODIGO,
          TIPO_DOCUMENTO: parent.TIPO_DOCUMENTO,
          NOMBRE_DOCUMENTO: parent.NOMBRE_DOCUMENTO,
          APROBACION: parent.APROBACION,
          ESTATUS_ASO: childEstatusText,
          DATO_ASOCIADO: child.CODIGO, 
          NOMBRE_DOC_ASOCIADO: child.NOMBRE_DOCUMENTO,
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
