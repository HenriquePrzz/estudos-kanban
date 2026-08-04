"use client"

import { useEffect, useState } from "react"

const frases = [
  "Lembre por que você começou.",
  "Pequenos passos também constroem grandes resultados.",
  "A constância transforma intenção em conquista.",
  "Continue. Seu futuro está sendo construído agora.",
  "Aprender hoje é avançar amanhã.",
]

const TEMPO_ENTRE_FRASES = 5000
const DURACAO_ANIMACAO = 500

export default function HomePage() {
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    let temporizadorAnimacao: ReturnType<typeof setTimeout>

    const temporizadorFrases = setInterval(() => {
      // Desaparece suavemente
      setVisivel(false)

      temporizadorAnimacao = setTimeout(() => {
        // Troca para a próxima frase
        setIndiceAtual((indiceAnterior) =>
          indiceAnterior === frases.length - 1
            ? 0
            : indiceAnterior + 1
        )

        // Aparece novamente
        setVisivel(true)
      }, DURACAO_ANIMACAO)
    }, TEMPO_ENTRE_FRASES)

    return () => {
      clearInterval(temporizadorFrases)
      clearTimeout(temporizadorAnimacao)
    }
  }, [])

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171717] px-6">
      {/* Estampa topográfica */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[url('/topografia.png')]
          bg-cover
          bg-center
          bg-no-repeat
          opacity-[0.04]
          invert
          mix-blend-screen
        "
      />

      {/* Frase que muda automaticamente */}
      <h1
        className={`
          relative z-10
          max-w-5xl
          text-balance
          text-center
          font-serif
          text-4xl
          leading-tight
          text-[#FAFAFA]
          transition-all
          duration-500
          ease-in-out
          sm:text-5xl
          md:text-6xl
          lg:text-7xl
          ${
            visivel
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }
        `}
      >
        {frases[indiceAtual]}
      </h1>
    </main>
  )
}