"use server"

import { db } from "@/lib/db"
import {
  cardComments,
} from "@/lib/db/schema"
import {
  desc,
  eq,
} from "drizzle-orm"

export type CardCommentDTO = {
  id: number
  cardId: number
  content: string
  createdAt: string
}

function validateCardId(cardId: number) {
  if (
    !Number.isInteger(cardId) ||
    cardId <= 0
  ) {
    throw new Error("Identificador do card inválido.")
  }
}

function serializeComment(comment: {
  id: number
  cardId: number
  content: string
  createdAt: Date
}): CardCommentDTO {
  return {
    id: comment.id,
    cardId: comment.cardId,
    content: comment.content,
    createdAt:
      comment.createdAt.toISOString(),
  }
}

/**
 * Busca os comentários do card.
 * Os mais recentes aparecem primeiro.
 */
export async function getCardComments(
  cardId: number,
): Promise<CardCommentDTO[]> {
  validateCardId(cardId)

  const comments = await db
    .select({
      id: cardComments.id,
      cardId: cardComments.cardId,
      content: cardComments.content,
      createdAt: cardComments.createdAt,
    })
    .from(cardComments)
    .where(
      eq(cardComments.cardId, cardId),
    )
    .orderBy(
      desc(cardComments.createdAt),
    )

  return comments.map(serializeComment)
}

/**
 * Salva um novo comentário.
 */
export async function createCardComment(input: {
  cardId: number
  content: string
}): Promise<CardCommentDTO> {
  validateCardId(input.cardId)

  const content = input.content.trim()

  if (!content) {
    throw new Error(
      "Escreva alguma coisa antes de salvar.",
    )
  }

  if (content.length > 20000) {
    throw new Error(
      "O comentário ultrapassou o limite permitido.",
    )
  }

  const [createdComment] = await db
    .insert(cardComments)
    .values({
      cardId: input.cardId,
      content,
    })
    .returning({
      id: cardComments.id,
      cardId: cardComments.cardId,
      content: cardComments.content,
      createdAt: cardComments.createdAt,
    })

  if (!createdComment) {
    throw new Error(
      "Não foi possível salvar o comentário.",
    )
  }

  return serializeComment(createdComment)
}