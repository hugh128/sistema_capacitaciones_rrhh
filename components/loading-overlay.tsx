"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export function LoadingOverlay() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.target) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)
        
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setIsLoading(true)
        }
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/5 z-[100] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 bg-card p-8 rounded-lg shadow-lg border">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-base text-foreground">Cargando módulo...</p>
      </div>
    </div>
  )
}
