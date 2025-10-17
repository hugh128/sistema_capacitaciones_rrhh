"use client"

import { useState, useMemo } from "react"
import type { CodigoPadre } from "./types"

/* export function useCodigosFilter(codigos: CodigoPadre[], searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) return codigos

    const query = searchQuery.toLowerCase()
    return codigos.filter(
      (codigo) =>
        codigo.CODIGO.toLowerCase().includes(query) ||
        codigo.TIPO_DOCUMENTO.toLowerCase().includes(query) ||
        codigo.NOMBRE_DOCUMENTO.toLowerCase().includes(query)
        codigo.ESTATUS.toLowerCase().includes(query),
    )
  }, [codigos, searchQuery])
} */

export function useCodigosFilter(codigos: CodigoPadre[], searchQuery: string) {
  return useMemo(() => {
    if (!searchQuery.trim()) return codigos

    const query = searchQuery.toLowerCase().trim()

    return codigos.filter((codigo) => {
      const parentFields = [
        codigo.CODIGO,
        codigo.TIPO_DOCUMENTO,
        codigo.NOMBRE_DOCUMENTO,
        codigo.ESTATUS,
      ].join(' ').toLowerCase()

      if (parentFields.includes(query)) {
        return true
      }
      
      const matchesChildren = codigo.DOCUMENTOS_ASOCIADOS.some(hijo => 
        hijo.CODIGO.toLowerCase().includes(query) || 
        hijo.NOMBRE_DOCUMENTO.toLowerCase().includes(query)
      )

      return matchesChildren
    })
  }, [codigos, searchQuery])
}

export function useCodigosPagination(codigos: CodigoPadre[], currentPage: number, itemsPerPage: number) {
  return useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return codigos.slice(startIndex, startIndex + itemsPerPage)
  }, [codigos, currentPage, itemsPerPage])
}

export function useChildPagination() {
  const [childPages, setChildPages] = useState<{ [parentId: string]: number }>({})

  const getChildPage = (parentId: string) => childPages[parentId] || 1

  const setChildPage = (parentId: string, page: number) => {
    setChildPages((prev) => ({ ...prev, [parentId]: page }))
  }

  return { getChildPage, setChildPage }
}
