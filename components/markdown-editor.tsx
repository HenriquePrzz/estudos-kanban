"use client"

import { useEffect, useState, type ReactNode } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { Image } from "@tiptap/extension-image"

import {
  Bold,
  Braces,
  Code2,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react"

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva a descrição do card...",
}: MarkdownEditorProps) {
  const [isEmpty, setIsEmpty] = useState(!value.trim())
  const [characterCount, setCharacterCount] = useState(0)

  /*
   * Este estado serve para atualizar visualmente os botões
   * quando a seleção do texto muda.
   */
  const [, setEditorVersion] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },

        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            class: "text-blue-400 underline underline-offset-4",
          },
        },
      }),

      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class:
            "my-4 max-h-80 max-w-full rounded-lg border border-border object-contain",
        },
      }),

      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
        },
      }),
    ],

    /*
     * O conteúdo que já existe no banco continua sendo
     * interpretado como Markdown.
     */
    content: value || "",
    contentType: "markdown",

    editorProps: {
      attributes: {
        class:
          "min-h-64 px-5 py-4 text-sm leading-7 text-foreground outline-none",
      },
    },

    onCreate: ({ editor }) => {
      setIsEmpty(editor.isEmpty)
      setCharacterCount(editor.state.doc.textContent.length)
    },

    onSelectionUpdate: () => {
      setEditorVersion((current) => current + 1)
    },

    onUpdate: ({ editor }) => {
      /*
       * Apesar de aparecer formatado no editor,
       * continua sendo salvo como Markdown no banco.
       */
      onChange(editor.getMarkdown())

      setIsEmpty(editor.isEmpty)
      setCharacterCount(editor.state.doc.textContent.length)
      setEditorVersion((current) => current + 1)
    },
  })

  /*
   * Atualiza o editor caso outro card seja aberto
   * sem recriar todo o componente.
   */
  useEffect(() => {
    if (!editor) {
      return
    }

    const currentMarkdown = editor.getMarkdown()

    if (currentMarkdown === value) {
      return
    }

    editor.commands.setContent(value || "", {
      contentType: "markdown",
      emitUpdate: false,
    })

    setIsEmpty(editor.isEmpty)
    setCharacterCount(editor.state.doc.textContent.length)
  }, [editor, value])

  if (!editor) {
    return (
      <div className="min-h-72 animate-pulse rounded-xl border border-input bg-background/40" />
    )
  }

  function configureLink() {
    const previousUrl =
      editor?.getAttributes("link").href || ""

    const url = window.prompt(
      "Digite o endereço do link:",
      previousUrl || "https://",
    )

    if (url === null || !editor) {
      return
    }

    if (!url.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run()

      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url.trim(),
      })
      .run()
  }

  function insertImage() {
    const url = window.prompt(
      "Cole o endereço da imagem:",
      "https://",
    )

    if (!url?.trim() || !editor) {
      return
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
      })
      .run()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-input bg-background/40 focus-within:border-foreground/40">
      {/* Barra de ferramentas */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 px-3 py-2">
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          <Bold className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Sublinhado"
          active={editor.isActive("underline")}
          onClick={() =>
            editor.chain().focus().toggleUnderline().run()
          }
        >
          <Underline className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Riscado"
          active={editor.isActive("strike")}
          onClick={() =>
            editor.chain().focus().toggleStrike().run()
          }
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Título principal"
          active={editor.isActive("heading", {
            level: 1,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 1,
              })
              .run()
          }
        >
          <Heading1 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Subtítulo"
          active={editor.isActive("heading", {
            level: 2,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          <Heading2 className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Lista com marcadores"
          active={editor.isActive("bulletList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          <List className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Citação"
          active={editor.isActive("blockquote")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBlockquote()
              .run()
          }
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          label="Código em linha"
          active={editor.isActive("code")}
          onClick={() =>
            editor.chain().focus().toggleCode().run()
          }
        >
          <Code2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Bloco de código"
          active={editor.isActive("codeBlock")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleCodeBlock()
              .run()
          }
        >
          <Braces className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Adicionar link"
          active={editor.isActive("link")}
          onClick={configureLink}
        >
          <Link2 className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Adicionar imagem por URL"
          onClick={insertImage}
        >
          <ImageIcon className="size-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Linha divisória"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHorizontalRule()
              .run()
          }
        >
          <Minus className="size-4" />
        </ToolbarButton>
      </div>

      {/* Área visual de escrita */}
      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-5 top-4 z-10 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}

        <EditorContent
          editor={editor}
          className="
            [&_.ProseMirror]:min-h-64

            [&_.ProseMirror_p]:my-2

            [&_.ProseMirror_h1]:mb-3
            [&_.ProseMirror_h1]:mt-4
            [&_.ProseMirror_h1]:text-2xl
            [&_.ProseMirror_h1]:font-bold
            [&_.ProseMirror_h1]:leading-tight

            [&_.ProseMirror_h2]:mb-2
            [&_.ProseMirror_h2]:mt-4
            [&_.ProseMirror_h2]:text-xl
            [&_.ProseMirror_h2]:font-semibold

            [&_.ProseMirror_ul]:my-3
            [&_.ProseMirror_ul]:list-disc
            [&_.ProseMirror_ul]:pl-6

            [&_.ProseMirror_ol]:my-3
            [&_.ProseMirror_ol]:list-decimal
            [&_.ProseMirror_ol]:pl-6

            [&_.ProseMirror_li]:my-1

            [&_.ProseMirror_blockquote]:my-4
            [&_.ProseMirror_blockquote]:border-l-4
            [&_.ProseMirror_blockquote]:border-border
            [&_.ProseMirror_blockquote]:pl-4
            [&_.ProseMirror_blockquote]:italic
            [&_.ProseMirror_blockquote]:text-muted-foreground

            [&_.ProseMirror_code]:rounded
            [&_.ProseMirror_code]:bg-secondary
            [&_.ProseMirror_code]:px-1.5
            [&_.ProseMirror_code]:py-0.5
            [&_.ProseMirror_code]:font-mono
            [&_.ProseMirror_code]:text-xs

            [&_.ProseMirror_pre]:my-4
            [&_.ProseMirror_pre]:overflow-x-auto
            [&_.ProseMirror_pre]:rounded-lg
            [&_.ProseMirror_pre]:bg-secondary
            [&_.ProseMirror_pre]:p-4

            [&_.ProseMirror_pre_code]:bg-transparent
            [&_.ProseMirror_pre_code]:p-0

            [&_.ProseMirror_a]:text-blue-400
            [&_.ProseMirror_a]:underline
            [&_.ProseMirror_a]:underline-offset-4

            [&_.ProseMirror_hr]:my-5
            [&_.ProseMirror_hr]:border-border

            [&_.ProseMirror_img]:my-4
            [&_.ProseMirror_img]:max-h-80
            [&_.ProseMirror_img]:max-w-full
            [&_.ProseMirror_img]:rounded-lg
            [&_.ProseMirror_img]:border
            [&_.ProseMirror_img]:border-border
            [&_.ProseMirror_img]:object-contain
          "
        />
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        <span>Editor visual · salvo como Markdown</span>

        <span>
          {characterCount} caracteres
        </span>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        /*
         * Mantém a seleção do texto quando o botão é clicado.
         */
        event.preventDefault()
      }}
      onClick={onClick}
      className={[
        "grid size-8 place-items-center rounded-md transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return (
    <span
      aria-hidden="true"
      className="mx-1 h-5 w-px bg-border"
    />
  )
}