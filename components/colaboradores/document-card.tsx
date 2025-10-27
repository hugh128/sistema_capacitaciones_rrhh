"use client"

import { FileText } from "lucide-react"

interface DocumentCardProps {
  name: string
  type: "pdf" | "doc" | string
  date: string
  onClick?: () => void
}

export default function DocumentCard({ name, type, date, onClick }: DocumentCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-50 dark:bg-blue-950 border border-border rounded-md p-3 flex flex-col gap-2 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-primary transition-colors cursor-pointer text-left"
    >
      <div className="flex items-center gap-2">
        <FileText className={`w-4 h-4 flex-shrink-0 ${type === "pdf" ? "text-red-500" : "text-blue-500"}`} />
        <span className="text-base text-foreground truncate">{name}</span>
      </div>
      <span className="text-xs text-muted-foreground">{date}</span>
    </button>
  )
}
