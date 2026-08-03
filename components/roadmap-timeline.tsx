"use client"

import { useState } from "react"
import { Check, Circle, Loader, Plus, Trash2 } from "lucide-react"
import type { Milestone } from "@/lib/db/schema"
import {
  createMilestone,
  deleteMilestone,
  updateMilestone,
} from "@/app/actions/milestones"
import { cn } from "@/lib/utils"

const STATUSES = [
  { key: "planejado", label: "Planejado" },
  { key: "andamento", label: "Em andamento" },
  { key: "concluido", label: "Concluído" },
] as const

function statusMeta(status: string) {
  switch (status) {
    case "concluido":
      return { label: "Concluído", icon: Check, dot: "bg-emerald-500 text-white border-emerald-500" }
    case "andamento":
      return { label: "Em andamento", icon: Loader, dot: "bg-amber-500 text-white border-amber-500" }
    default:
      return { label: "Planejado", icon: Circle, dot: "bg-secondary text-muted-foreground border-border" }
  }
}

export function RoadmapTimeline({ initialMilestones }: { initialMilestones: Milestone[] }) {
  const [items, setItems] = useState<Milestone[]>(initialMilestones)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  async function handleAdd() {
    const t = title.trim()
    if (!t) {
      setAdding(false)
      return
    }
    const row = await createMilestone({ title: t, description: description.trim() })
    setItems((prev) => [...prev, row])
    setTitle("")
    setDescription("")
    setAdding(false)
  }

  async function cycleStatus(m: Milestone) {
    const order = ["planejado", "andamento", "concluido"]
    const next = order[(order.indexOf(m.status) + 1) % order.length]
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: next } : x)))
    await updateMilestone({ id: m.id, status: next })
  }

  async function handleDelete(id: number) {
    setItems((prev) => prev.filter((x) => x.id !== id))
    await deleteMilestone(id)
  }

  return (
    <div>
      <ol className="relative">
        {items.map((m, i) => {
          const meta = statusMeta(m.status)
          const Icon = meta.icon
          const isLast = i === items.length - 1
          return (
            <li key={m.id} className="relative flex gap-4 pb-6">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-border"
                />
              )}
              <button
                onClick={() => cycleStatus(m)}
                title="Alterar status"
                className={cn(
                  "z-10 flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform hover:scale-105",
                  meta.dot,
                )}
              >
                <Icon className="size-4" />
              </button>

              <div className="group flex-1 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {meta.label}
                    </span>
                    <h3 className="mt-0.5 text-base font-semibold text-card-foreground text-pretty">
                      {m.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    aria-label="Excluir marco"
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {m.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {m.description}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {adding ? (
        <div className="ml-12 flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do marco..."
            className="w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className="w-full resize-none rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setAdding(false)
                setTitle("")
                setDescription("")
              }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Adicionar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="ml-12 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Plus className="size-4" />
          Adicionar marco
        </button>
      )}
    </div>
  )
}
