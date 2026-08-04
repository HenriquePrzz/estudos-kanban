"use client"

import { registerStudySession } from "@/app/actions/pomodoro"
import {
  Brain,
  CheckCircle2,
  Coffee,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

type TimerMode = "focus" | "break"

type SaveStatus =
  | "idle"
  | "saving"
  | "success"
  | "error"

const MIN_MINUTES = 1
const MAX_MINUTES = 240

function limitMinutes(value: number) {
  if (!Number.isFinite(value)) {
    return MIN_MINUTES
  }

  return Math.min(
    MAX_MINUTES,
    Math.max(MIN_MINUTES, Math.floor(value)),
  )
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`
}

/**
 * Cria a data usando o horário local do navegador.
 * Exemplo: 2026-08-04
 */
function createLocalDateKey(date: Date) {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0")

  const day = String(
    date.getDate(),
  ).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function PomodoroTimer() {
  const router = useRouter()

  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)

  const [mode, setMode] =
    useState<TimerMode>("focus")

  const [secondsLeft, setSecondsLeft] =
    useState(25 * 60)

  const [isRunning, setIsRunning] =
    useState(false)

  const [saveStatus, setSaveStatus] =
    useState<SaveStatus>("idle")

  const [saveError, setSaveError] =
    useState<string | null>(null)

  /**
   * Horário exato em que o timer deverá terminar.
   * Isso evita atrasos quando a aba fica em segundo plano.
   */
  const endTimeRef = useRef<number | null>(null)

  /**
   * Impede que uma mesma sessão seja finalizada duas vezes.
   */
  const completingRef = useRef(false)

  const currentMinutes =
    mode === "focus"
      ? focusMinutes
      : breakMinutes

  const totalSeconds = currentMinutes * 60

  const progress =
    totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            ((totalSeconds - secondsLeft) /
              totalSeconds) *
              100,
          ),
        )
      : 0

  const finishCurrentMode = useCallback(() => {
    if (completingRef.current) {
      return
    }

    completingRef.current = true
    endTimeRef.current = null
    setIsRunning(false)

    if (mode === "focus") {
      const completedMinutes = focusMinutes
      const studyDate = createLocalDateKey(
        new Date(),
      )

      /*
       * Troca automaticamente para a pausa.
       * A pausa fica pronta, mas não começa sozinha.
       */
      setMode("break")
      setSecondsLeft(breakMinutes * 60)

      setSaveStatus("saving")
      setSaveError(null)

      void registerStudySession({
        studyDate,
        focusMinutes: completedMinutes,
      })
        .then(() => {
          setSaveStatus("success")

          /*
           * Busca novamente os registros no servidor,
           * atualizando calendário e indicadores.
           */
          router.refresh()
        })
        .catch((error: unknown) => {
          console.error(
            "Erro ao salvar sessão Pomodoro:",
            error,
          )

          setSaveStatus("error")
          setSaveError(
            "A sessão terminou, mas não foi possível salvá-la no Neon.",
          )
        })
    } else {
      /*
       * Quando a pausa termina,
       * prepara novamente o tempo de foco.
       */
      setMode("focus")
      setSecondsLeft(focusMinutes * 60)
      setSaveStatus("idle")
      setSaveError(null)
    }

    window.setTimeout(() => {
      completingRef.current = false
    }, 0)
  }, [
    breakMinutes,
    focusMinutes,
    mode,
    router,
  ])

  /**
   * Atualiza o relógio enquanto estiver rodando.
   */
  useEffect(() => {
    if (!isRunning) {
      return
    }

    function updateTimer() {
      const endTime = endTimeRef.current

      if (!endTime) {
        return
      }

      const remainingSeconds = Math.max(
        0,
        Math.ceil(
          (endTime - Date.now()) / 1000,
        ),
      )

      setSecondsLeft(remainingSeconds)

      if (remainingSeconds === 0) {
        finishCurrentMode()
      }
    }

    updateTimer()

    const interval = window.setInterval(
      updateTimer,
      250,
    )

    return () => {
      window.clearInterval(interval)
    }
  }, [finishCurrentMode, isRunning])

  /**
   * Mostra o tempo também na aba do navegador.
   */
  useEffect(() => {
    if (!isRunning) {
      document.title = "Pomodoro"
      return
    }

    const modeLabel =
      mode === "focus" ? "Foco" : "Pausa"

    document.title = `${formatTime(
      secondsLeft,
    )} — ${modeLabel}`

    return () => {
      document.title = "Pomodoro"
    }
  }, [isRunning, mode, secondsLeft])

  function toggleTimer() {
    if (isRunning) {
      const endTime = endTimeRef.current

      if (endTime) {
        const remainingSeconds = Math.max(
          0,
          Math.ceil(
            (endTime - Date.now()) / 1000,
          ),
        )

        setSecondsLeft(remainingSeconds)
      }

      endTimeRef.current = null
      setIsRunning(false)

      return
    }

    if (secondsLeft <= 0) {
      return
    }

    endTimeRef.current =
      Date.now() + secondsLeft * 1000

    setIsRunning(true)
    setSaveStatus("idle")
    setSaveError(null)
  }

  function resetTimer() {
    endTimeRef.current = null
    setIsRunning(false)

    const minutes =
      mode === "focus"
        ? focusMinutes
        : breakMinutes

    setSecondsLeft(minutes * 60)
    setSaveStatus("idle")
    setSaveError(null)
  }

  function selectMode(nextMode: TimerMode) {
    endTimeRef.current = null
    setIsRunning(false)
    setMode(nextMode)
    setSaveStatus("idle")
    setSaveError(null)

    const minutes =
      nextMode === "focus"
        ? focusMinutes
        : breakMinutes

    setSecondsLeft(minutes * 60)
  }

  function updateFocusMinutes(value: number) {
    const normalizedValue =
      limitMinutes(value)

    setFocusMinutes(normalizedValue)

    if (!isRunning && mode === "focus") {
      setSecondsLeft(
        normalizedValue * 60,
      )
    }
  }

  function updateBreakMinutes(value: number) {
    const normalizedValue =
      limitMinutes(value)

    setBreakMinutes(normalizedValue)

    if (!isRunning && mode === "break") {
      setSecondsLeft(
        normalizedValue * 60,
      )
    }
  }

  return (
    <section className="w-full rounded-2xl border border-border bg-card p-5 md:p-6 xl:sticky xl:top-6">
      {/* Alternância entre foco e pausa */}
      <div className="mb-6 grid grid-cols-2 rounded-xl border border-border bg-background/40 p-1">
        <button
          type="button"
          onClick={() => selectMode("focus")}
          className={[
            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            mode === "focus"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Brain className="size-4" />
          Foco
        </button>

        <button
          type="button"
          onClick={() => selectMode("break")}
          className={[
            "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            mode === "break"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Coffee className="size-4" />
          Pausa
        </button>
      </div>

      {/* Relógio circular */}
      <div className="relative mx-auto grid size-64 place-items-center">
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 size-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-border"
          />

          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className="text-foreground transition-[stroke-dashoffset] duration-300"
          />
        </svg>

        <div className="relative z-10 text-center">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {mode === "focus"
              ? "Tempo de foco"
              : "Tempo de pausa"}
          </p>

          <p className="font-mono text-5xl font-semibold tracking-[-0.07em] text-foreground">
            {formatTime(secondsLeft)}
          </p>

          <p className="mt-3 text-xs text-muted-foreground">
            {isRunning
              ? "Sessão em andamento"
              : "Pronto para começar"}
          </p>
        </div>
      </div>

      {/* Botões */}
      <div className="mt-7 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={toggleTimer}
          className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          {isRunning ? (
            <>
              <Pause className="size-4" />
              Pausar
            </>
          ) : (
            <>
              <Play className="size-4 fill-current" />
              Iniciar
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          aria-label="Reiniciar timer"
          title="Reiniciar timer"
          className="grid size-11 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="size-4" />
        </button>
      </div>

      {/* Configuração */}
      <div className="mt-7 grid grid-cols-2 gap-3 border-t border-border pt-5">
        <label className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Foco
          </span>

          <div className="relative">
            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={focusMinutes}
              disabled={isRunning}
              onChange={(event) =>
                updateFocusMinutes(
                  Number(event.target.value),
                )
              }
              className="h-11 w-full rounded-xl border border-input bg-background px-3 pr-12 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              min
            </span>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">
            Pausa
          </span>

          <div className="relative">
            <input
              type="number"
              min={MIN_MINUTES}
              max={MAX_MINUTES}
              value={breakMinutes}
              disabled={isRunning}
              onChange={(event) =>
                updateBreakMinutes(
                  Number(event.target.value),
                )
              }
              className="h-11 w-full rounded-xl border border-input bg-background px-3 pr-12 text-sm text-foreground outline-none transition-colors focus:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              min
            </span>
          </div>
        </label>
      </div>

      {/* Estado do salvamento */}
      <div className="mt-5 min-h-10">
        {saveStatus === "saving" && (
          <p className="text-center text-xs text-muted-foreground">
            Salvando sessão no Neon...
          </p>
        )}

        {saveStatus === "success" && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="size-4" />
            Sessão salva no calendário.
          </div>
        )}

        {saveStatus === "error" && (
          <p className="text-center text-xs leading-relaxed text-red-400">
            {saveError}
          </p>
        )}

        {saveStatus === "idle" && (
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Uma sessão é salva quando o tempo de foco termina.
          </p>
        )}
      </div>
    </section>
  )
}