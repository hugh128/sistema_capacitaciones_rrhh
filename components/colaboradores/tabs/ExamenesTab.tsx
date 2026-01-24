import { FilePenLine } from "lucide-react"
import DocumentCard from "../document-card"
import type { DocumentoColaborador } from "@/lib/colaboradores/type"

type ExamenesTabProps = {
  documentosColaborador: DocumentoColaborador[]
  onDownloadExamen: (colaboradorId: number, sesionId: number) => void
}

export default function ExamenesTab({
  documentosColaborador,
  onDownloadExamen,
}: ExamenesTabProps) {
  const examenes = documentosColaborador.filter((doc) => doc.TIPO === "EXAMEN")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Exámenes Realizados</h2>
      </div>
      {examenes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {examenes.map((doc, index) => (
            <DocumentCard
              key={index}
              name={doc.NOMBRE_DOCUMENTO}
              type={doc.FILE_TYPE}
              date={doc.FECHA_CONTEO}
              onClick={() => onDownloadExamen(doc.ID_COLABORADOR, doc.ID_SESION)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <FilePenLine className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">
            No se han encontrado exámenes realizados para este colaborador.
          </p>
        </div>
      )}
    </div>
  )
}
