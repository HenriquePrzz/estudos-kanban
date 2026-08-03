"use client"

import { useEffect, useState } from "react"
import { Trash2, X } from "lucide-react"
import type { Card } from "@/lib/db/schema"

type Props = {
  card: Card
  onClose: () => void
  onSave: (patch: { title: string; description: string }) => void
  onDelete: () => void
}

export function CardModal({ card, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  function handleSave() {
    onSave({ title: title.trim() || card.title, description })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes do card"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border p-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Título do card"
            className="w-full bg-transparent text-lg font-semibold text-card-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Título do card"
          />
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex min-h-64 flex-1 flex-col overflow-y-auto p-4">
          <textarea
            autoFocus
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Descrição em Markdown"
            placeholder="Escreva em Markdown... use # títulos, **negrito**, listas, `código`, etc."
            className="min-h-64 w-full flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>

        <footer className="flex items-center justify-between border-t border-border p-4">
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Excluir
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Salvar
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
