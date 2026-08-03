"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import type { Card } from "@/lib/db/schema"
import { createCard, deleteCard, moveCard, updateCard } from "@/app/actions/cards"
import { CardModal } from "@/components/card-modal"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { key: "iniciar", label: "Iniciar" },
  { key: "aprendendo", label: "Aprendendo" },
  { key: "exercicios", label: "Exercícios" },
  { key: "finalizado", label: "Finalizado" },
] as const

export function KanbanBoard({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState<Card[]>(initialCards)
  const [openCard, setOpenCard] = useState<Card | null>(null)
  const [addingIn, setAddingIn] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  function cardsFor(colKey: string) {
    return cards
      .filter((c) => c.columnKey === colKey)
      .sort((a, b) => a.position - b.position)
  }

  async function handleAdd(colKey: string) {
    const title = newTitle.trim()
    if (!title) {
      setAddingIn(null)
      return
    }
    setNewTitle("")
    setAddingIn(null)
    const row = await createCard({ title, columnKey: colKey })
    setCards((prev) => [...prev, row])
  }

  async function handleSave(id: number, patch: { title: string; description: string }) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    await updateCard({ id, ...patch })
  }

  async function handleDelete(id: number) {
    setCards((prev) => prev.filter((c) => c.id !== id))
    await deleteCard(id)
  }

  async function handleDrop(colKey: string) {
    setDragOverCol(null)
    const id = dragId
    setDragId(null)
    if (id == null) return
    const dragged = cards.find((c) => c.id === id)
    if (!dragged || dragged.columnKey === colKey) return

    const position = cardsFor(colKey).length
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, columnKey: colKey, position } : c)),
    )
    await moveCard({ id, columnKey: colKey, position })
  }

  return (
    <>
      <div className="grid grid-cols-4 divide-x divide-border overflow-hidden rounded-xl border border-border bg-secondary/40">
        {COLUMNS.map((col) => {
          const colCards = cardsFor(col.key)
          return (
            <section
              key={col.key}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOverCol(col.key)
              }}
              onDragLeave={() => setDragOverCol((cur) => (cur === col.key ? null : cur))}
              onDrop={() => handleDrop(col.key)}
              className={cn(
                "flex min-w-0 flex-col transition-colors",
                dragOverCol === col.key && "bg-secondary/70",
              )}
            >
              <header className="flex items-center justify-between px-4 pb-2 pt-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </h2>
                  <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">
                    {colCards.length}
                  </span>
                </div>
              </header>

              <div className="flex flex-1 flex-col gap-2 px-3 pb-2">
                {colCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    draggable
                    onDragStart={() => setDragId(card.id)}
                    onDragEnd={() => {
                      setDragId(null)
                      setDragOverCol(null)
                    }}
                    onClick={() => setOpenCard(card)}
                    className={cn(
                      "group flex min-h-16 cursor-grab items-start rounded-lg border border-border bg-card p-3 pb-[27px] text-left transition-all hover:border-foreground/20 active:cursor-grabbing",
                      dragId === card.id && "opacity-40",
                    )}
                  >
                    <p className="text-sm font-medium leading-snug text-card-foreground">
                      {card.title}
                    </p>
                  </button>
                ))}
              </div>

              <div className="p-3 pt-1">
                {addingIn === col.key ? (
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={() => handleAdd(col.key)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing || e.keyCode === 229) return
                      if (e.key === "Enter") handleAdd(col.key)
                      if (e.key === "Escape") {
                        setNewTitle("")
                        setAddingIn(null)
                      }
                    }}
                    placeholder="Título do card..."
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30"
                  />
                ) : (
                  <button
                    onClick={() => {
                      setNewTitle("")
                      setAddingIn(col.key)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <Plus className="size-4" />
                    Adicionar card
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </div>

      {openCard && (
        <CardModal
          key={openCard.id}
          card={openCard}
          onClose={() => setOpenCard(null)}
          onSave={(patch) => handleSave(openCard.id, patch)}
          onDelete={() => handleDelete(openCard.id)}
        />
      )}
    </>
  )
}
