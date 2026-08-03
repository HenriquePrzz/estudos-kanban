"use server"

import { db } from "@/lib/db"
import { milestones } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getMilestones() {
  return db.select().from(milestones).orderBy(asc(milestones.position), asc(milestones.createdAt))
}

export async function createMilestone(input: { title: string; description?: string; status?: string }) {
  const title = input.title.trim()
  if (!title) throw new Error("Título obrigatório")

  const all = await db.select().from(milestones)
  const position = all.length

  const [row] = await db
    .insert(milestones)
    .values({
      title,
      description: input.description ?? "",
      status: input.status ?? "planejado",
      position,
    })
    .returning()
  revalidatePath("/roadmap")
  return row
}

export async function updateMilestone(input: {
  id: number
  title?: string
  description?: string
  status?: string
}) {
  const patch: Record<string, unknown> = {}
  if (typeof input.title === "string") patch.title = input.title.trim()
  if (typeof input.description === "string") patch.description = input.description
  if (typeof input.status === "string") patch.status = input.status
  if (Object.keys(patch).length === 0) return
  await db.update(milestones).set(patch).where(eq(milestones.id, input.id))
  revalidatePath("/roadmap")
}

export async function deleteMilestone(id: number) {
  await db.delete(milestones).where(eq(milestones.id, id))
  revalidatePath("/roadmap")
}
