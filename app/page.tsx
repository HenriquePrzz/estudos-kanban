"use client"

import { useEffect, useState } from "react"

const frases = [
  "Lembre por que você começou.",
  "Todo progresso começa com uma decisão.",
  "A constância transforma intenção em resultado.",
  "Aprenda hoje o que vai construir seu amanhã.",
  "Um passo de cada vez ainda é progresso.",
]

export default function HomePage() {
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [fraseVisivel, setFraseVisivel] = useState(true)

  useEffect(() => {
    let temporizadorTroca: ReturnType<typeof setTimeout>

    const intervalo = setInterval(() => {
      setFraseVisivel(false)

      temporizadorTroca = setTimeout(() => {
        setIndiceAtual((indiceAnterior) => {
          return (indiceAnterior + 1) % frases.length
        })

        setFraseVisivel(true)
      }, 500)
    }, 6000)

    return () => {
      clearInterval(intervalo)
      clearTimeout(temporizadorTroca)
    }
  }, [])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Fundo topográfico */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100"
        style={{
          backgroundImage: "url('/topografia.png')",
        }}
      />

      {/* Vinheta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(23,23,23,0.2) 0%, rgba(23,23,23,0.85) 100%)",
        }}
      />

      {/* Frase que muda automaticamente */}
      <h1
        className={`
          relative z-10
          max-w-5xl
          text-balance text-center
          font-serif
          text-4xl leading-tight
          text-foreground
          transition-all duration-500 ease-in-out
          sm:text-5xl md:text-6xl lg:text-7xl
          ${
            fraseVisivel
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }
        `}
      >
        {frases[indiceAtual]}
      </h1>
    </div>
  )
}