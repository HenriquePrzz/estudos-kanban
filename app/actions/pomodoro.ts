"use server"

import { db } from "@/lib/db"
import { studyDays } from "@/lib/db/schema"
import { asc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type RegisterStudySessionInput = {
  studyDate: string
  focusMinutes: number
}

/**
 * Confere se a data realmente existe.
 * O formato esperado é: AAAA-MM-DD
 */
function isValidStudyDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

/**
 * Busca todos os dias estudados.
 * Será utilizada pelo calendário do Pomodoro.
 */
export async function getStudyDays() {
  const records = await db
    .select({
      id: studyDays.id,
      studyDate: studyDays.studyDate,
      sessions: studyDays.sessions,
      focusMinutes: studyDays.focusMinutes,
      createdAt: studyDays.createdAt,
      updatedAt: studyDays.updatedAt,
    })
    .from(studyDays)
    .orderBy(asc(studyDays.studyDate))

  return records
}

/**
 * Registra uma sessão concluída.
 *
 * Se ainda não existir registro na data:
 * cria uma nova linha.
 *
 * Se a data já existir:
 * aumenta a quantidade de sessões e os minutos acumulados.
 */
export async function registerStudySession(
  input: RegisterStudySessionInput,
) {
  const studyDate = input.studyDate.trim()
  const focusMinutes = Math.trunc(Number(input.focusMinutes))

  if (!isValidStudyDate(studyDate)) {
    throw new Error(
      "Data inválida. Utilize o formato AAAA-MM-DD.",
    )
  }

  if (
    !Number.isInteger(focusMinutes) ||
    focusMinutes < 1 ||
    focusMinutes > 240
  ) {
    throw new Error(
      "O tempo de foco deve estar entre 1 e 240 minutos.",
    )
  }

  const [savedDay] = await db
    .insert(studyDays)
    .values({
      studyDate,
      sessions: 1,
      focusMinutes,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: studyDays.studyDate,
      set: {
        sessions: sql`${studyDays.sessions} + 1`,
        focusMinutes: sql`
          ${studyDays.focusMinutes} + ${focusMinutes}
        `,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: studyDays.id,
      studyDate: studyDays.studyDate,
      sessions: studyDays.sessions,
      focusMinutes: studyDays.focusMinutes,
      createdAt: studyDays.createdAt,
      updatedAt: studyDays.updatedAt,
    })

  revalidatePath("/pomodoro")

  return savedDay
}