"use server"

import { db } from "@/lib/db"
import { cards } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCards() {
  return db.select().from(cards).orderBy(asc(cards.position), asc(cards.createdAt))
}

export async function createCard(input: { title: string; columnKey: string }) {
  const title = input.title.trim()
  if (!title) throw new Error("Título obrigatório")

  const existing = await db.select().from(cards).where(eq(cards.columnKey, input.columnKey))
  const position = existing.length

  const [row] = await db
    .insert(cards)
    .values({ title, columnKey: input.columnKey, position })
    .returning()
  revalidatePath("/kanban")
  return row
}

export async function updateCard(input: { id: number; title?: string; description?: string }) {
  const patch: Record<string, unknown> = {}
  if (typeof input.title === "string") patch.title = input.title.trim()
  if (typeof input.description === "string") patch.description = input.description
  if (Object.keys(patch).length === 0) return
  await db.update(cards).set(patch).where(eq(cards.id, input.id))
  revalidatePath("/kanban")
}

export async function moveCard(input: { id: number; columnKey: string; position: number }) {
  await db
    .update(cards)
    .set({ columnKey: input.columnKey, position: input.position })
    .where(eq(cards.id, input.id))
  revalidatePath("/kanban")
}

export async function deleteCard(id: number) {
  await db.delete(cards).where(eq(cards.id, id))
  revalidatePath("/kanban")
}
