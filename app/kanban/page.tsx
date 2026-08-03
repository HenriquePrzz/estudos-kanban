import { getCards } from "@/app/actions/cards"
import { KanbanBoard } from "@/components/kanban-board"

export default async function KanbanPage() {
  const cards = await getCards()

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Kanban</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize seus estudos arrastando os cards entre as colunas.
        </p>
      </header>
      <KanbanBoard initialCards={cards} />
    </div>
  )
}
