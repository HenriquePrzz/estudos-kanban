"use client"

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
} from "lucide-react"
import { useMemo, useState } from "react"

type StudyCalendarRecord = {
  studyDate: string
  sessions: number
  focusMinutes: number
}

type StudyCalendarProps = {
  records: StudyCalendarRecord[]
}

const weekDays = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
]

function createDateKey(
  year: number,
  month: number,
  day: number,
) {
  return [
    year,
    String(month + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-")
}

function createTodayKey() {
  const today = new Date()

  return createDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
}

export function StudyCalendar({
  records,
}: StudyCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    )
  })

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const recordsByDate = useMemo(() => {
    return new Map(
      records.map((record) => [
        record.studyDate,
        record,
      ]),
    )
  }, [records])

  const calendarDays = useMemo(() => {
    const firstWeekDay = new Date(
      year,
      month,
      1,
    ).getDay()

    const totalDays = new Date(
      year,
      month + 1,
      0,
    ).getDate()

    const days: Array<number | null> = [
      ...Array.from(
        { length: firstWeekDay },
        () => null,
      ),
      ...Array.from(
        { length: totalDays },
        (_, index) => index + 1,
      ),
    ]

    while (days.length % 7 !== 0) {
      days.push(null)
    }

    return days
  }, [month, year])

  const monthKey = `${year}-${String(
    month + 1,
  ).padStart(2, "0")}`

  const currentMonthRecords = records.filter((record) =>
    record.studyDate.startsWith(monthKey),
  )

  const studiedDays = currentMonthRecords.length

  const totalSessions = currentMonthRecords.reduce(
    (total, record) => total + record.sessions,
    0,
  )

  const totalFocusMinutes = currentMonthRecords.reduce(
    (total, record) => total + record.focusMinutes,
    0,
  )

  const monthLabel = visibleMonth.toLocaleDateString(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  )

  const todayKey = createTodayKey()

  function goToPreviousMonth() {
    setVisibleMonth(
      new Date(year, month - 1, 1),
    )
  }

  function goToNextMonth() {
    setVisibleMonth(
      new Date(year, month + 1, 1),
    )
  }

  function goToCurrentMonth() {
    const today = new Date()

    setVisibleMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    )
  }

  return (
  <div className="mx-auto w-full max-w-5xl">
    {/* Indicadores fora do calendário */}
    <div className="mx-auto mb-5 grid max-w-3xl gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4" />   

          <span className="text-xs font-medium uppercase tracking-wider">
            Dias estudados
          </span>
        </div>

        <p className="mt-2 text-2xl font-semibold text-foreground">
          {studiedDays}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Flame className="size-4" />

          <span className="text-xs font-medium uppercase tracking-wider">
            Sessões
          </span>
        </div>

        <p className="mt-2 text-2xl font-semibold text-foreground">
          {totalSessions}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock3 className="size-4" />

          <span className="text-xs font-medium uppercase tracking-wider">
            Minutos
          </span>
        </div>

        <p className="mt-2 text-2xl font-semibold text-foreground">
          {totalFocusMinutes}
        </p>
      </div>
    </div>

    {/* Box compacto do calendário */}
    <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 md:p-5">
      <header className="mb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Histórico de foco
          </p>

          <h2 className="mt-1 text-lg font-semibold text-card-foreground">
            Calendário de estudos
          </h2>
        </div>

        <button
          type="button"
          onClick={goToCurrentMonth}
          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Hoje
        </button>
      </header>

      {/* Navegação entre meses */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goToPreviousMonth}
          aria-label="Mostrar mês anterior"
          className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>

        <h3 className="capitalize text-sm font-semibold text-foreground">
          {monthLabel}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Mostrar próximo mês"
          className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="pb-1 text-center text-[11px] font-medium text-muted-foreground"
          >
            {weekDay}
          </div>
        ))}

        {/* Dias do mês */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="h-10 sm:h-11 md:h-12"
              />
            )
          }

          const dateKey = createDateKey(year, month, day)
          const studyRecord = recordsByDate.get(dateKey)
          const wasStudied = Boolean(studyRecord)
          const isToday = dateKey === todayKey

          return (
            <div
              key={dateKey}
              title={
                studyRecord
                  ? `${studyRecord.sessions} sessão(ões) — ${studyRecord.focusMinutes} minutos`
                  : undefined
              }
              className={[
                "group relative flex h-10 items-center justify-center rounded-lg border text-xs transition-all sm:h-11 sm:text-sm md:h-12",
                wasStudied
                  ? "border-emerald-400/30 bg-emerald-400/15 font-semibold text-emerald-300"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary",
                isToday && !wasStudied
                  ? "border-foreground/30 text-foreground"
                  : "",
              ].join(" ")}
            >
              <span>{day}</span>

              {wasStudied && (
                <>
                  <span className="absolute bottom-1.5 size-1 rounded-full bg-emerald-300" />

                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs font-normal text-popover-foreground shadow-xl group-hover:block">
                    <p>
                      {studyRecord?.sessions}{" "}
                      {studyRecord?.sessions === 1
                        ? "sessão"
                        : "sessões"}
                    </p>

                    <p className="mt-1 text-muted-foreground">
                      {studyRecord?.focusMinutes} minutos
                    </p>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      <footer className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-300" />

        Um dia será marcado quando uma sessão de foco for concluída.
      </footer>
    </section>
  </div>
)}