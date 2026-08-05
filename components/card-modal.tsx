"use client"

import { useEffect, useState } from "react"
import { Trash2, X } from "lucide-react"

import type { Card } from "@/lib/db/schema"
import { CardDiscussion } from "@/components/card-coment"

type Props = {
  card: Card
  onClose: () => void

  onSave: (patch: {
    title: string
    description: string
  }) => void

  onDelete: () => void
}

export function CardModal({
  card,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [title, setTitle] = useState(card.title)

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    )

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      )
    }
  }, [onClose])

  function handleSaveTitle() {
    onSave({
      title: title.trim() || card.title,

      // A antiga descrição permanece intacta,
      // mas não será mais mostrada na interface.
      description: card.description,
    })

    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="História do card"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Cabeçalho */}
        <header className="flex items-center justify-between gap-4 border-b border-border p-5">
          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            aria-label="Título do card"
            placeholder="Título do card"
            className="w-full bg-transparent text-xl font-semibold text-card-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Nome único da área */}
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            História
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Todo conteúdo salvo ficará registrado neste card.
          </p>
        </div>

        {/* Boxes e editor */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <CardDiscussion cardId={card.id} />
        </div>

        {/* Rodapé geral */}
        <footer className="flex items-center justify-between border-t border-border bg-card p-4">
          <button
            type="button"
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="size-4" />
            Excluir card
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={handleSaveTitle}
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Salvar título
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}