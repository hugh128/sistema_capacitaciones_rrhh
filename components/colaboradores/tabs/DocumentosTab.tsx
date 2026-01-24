import { FolderKanban } from "lucide-react"
import DocumentCard from "../document-card"
import type { DocumentoColaborador } from "@/lib/colaboradores/type"

type DocumentosTabProps = {
  documentosColaborador: DocumentoColaborador[]
  onDownloadAsistencia: (sesionId: number) => void
  onDownloadDiploma: (colaboradorId: number, sesionId: number) => void
}

export default function DocumentosTab({
  documentosColaborador,
  onDownloadAsistencia,
  onDownloadDiploma,
}: DocumentosTabProps) {
  const documentosRelevantes = documentosColaborador.filter(
    (doc) => doc.TIPO === "ASISTENCIA" || doc.TIPO === "DIPLOMA"
  )

  const categoriasDeseadas = ["Asistencia", "Diploma"]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Todos los Documentos</h2>
      </div>
      <div className="space-y-6">
        {categoriasDeseadas.map((category) => {
          const categoryDocs = documentosRelevantes.filter(
            (doc) => doc.CATEGORIA === category
          )

          if (categoryDocs.length === 0) return null

          return (
            <div key={category}>
              <h3 className="text-base font-semibold text-foreground mb-3">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categoryDocs.map((doc, index) => {
                  let downloadHandler
                  if (doc.TIPO === "ASISTENCIA") {
                    downloadHandler = () => onDownloadAsistencia(doc.ID_SESION)
                  } else if (doc.TIPO === "DIPLOMA") {
                    downloadHandler = () =>
                      onDownloadDiploma(doc.ID_COLABORADOR, doc.ID_SESION)
                  }

                  return (
                    <DocumentCard
                      key={index}
                      name={doc.NOMBRE_DOCUMENTO}
                      type={doc.FILE_TYPE}
                      date={doc.FECHA_CONTEO}
                      onClick={downloadHandler}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {documentosRelevantes.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <FolderKanban className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">
            No se han encontrado documentos de Asistencia o Diplomas.
          </p>
        </div>
      )}
    </div>
  )
}
