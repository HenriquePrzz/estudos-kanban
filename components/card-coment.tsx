"use client"

import { useEffect, useState } from "react"
import {
  LoaderCircle,
  Save,
} from "lucide-react"

import {
  createCardComment,
  getCardComments,
  type CardCommentDTO,
} from "@/app/actions/card-coment"

import { Markdown } from "@/components/markdown"
import { MarkdownEditor } from "@/components/markdown-editor"

type CardHistoryProps = {
  cardId: number
}

function formatHistoryDate(dateValue: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateValue))
}

export function CardDiscussion({
  cardId,
}: CardHistoryProps) {
  const [history, setHistory] =
    useState<CardCommentDTO[]>([])

  const [draft, setDraft] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadHistory() {
      setIsLoading(true)
      setError(null)

      try {
        const records = await getCardComments(cardId)

        if (isActive) {
          setHistory(records)
        }
      } catch (loadError) {
        console.error(
          "Erro ao carregar a história do card:",
          loadError,
        )

        if (isActive) {
          setError(
            "Não foi possível carregar a história deste card.",
          )
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      isActive = false
    }
  }, [cardId])

  async function handleSaveHistory() {
    if (!draft.trim() || isSaving) {
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const createdRecord =
        await createCardComment({
          cardId,
          content: draft,
        })

      // O novo conteúdo aparece no topo
      setHistory((currentHistory) => [
        createdRecord,
        ...currentHistory,
      ])

      // Limpa o editor depois de salvar
      setDraft("")
    } catch (saveError) {
      console.error(
        "Erro ao salvar a história:",
        saveError,
      )

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o conteúdo.",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      {/* Conteúdos já salvos */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />

            Carregando história...
          </div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              A história deste card está vazia.
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Escreva o primeiro conteúdo no editor abaixo.
            </p>
          </div>
        ) : (
          history.map((record) => (
            <article
              key={record.id}
              className="rounded-xl border border-border bg-background/30 p-5"
            >
              <header className="mb-4 flex items-center justify-between gap-4 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-semibold text-foreground">
                    V
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Você
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      Adicionou à história
                    </p>
                  </div>
                </div>

                <time
                  dateTime={record.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatHistoryDate(record.createdAt)}
                </time>
              </header>

              <Markdown>
                {record.content}
              </Markdown>
            </article>
          ))
        )}
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-border bg-card p-4">
        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          placeholder="Adicione um conteúdo à história..."
        />

        {error && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveHistory}
            disabled={isSaving || !draft.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  )
}