import { getStudyDays } from "@/app/actions/pomodoro"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { StudyCalendar } from "@/components/calendar"

export const dynamic = "force-dynamic"

type StudyDaysResult = Awaited<
  ReturnType<typeof getStudyDays>
>

export default async function PomodoroPage() {
  let studyDays: StudyDaysResult = []
  let databaseError = false

  try {
    studyDays = await getStudyDays()
  } catch (error) {
    console.error(
      "Erro ao buscar os dias estudados:",
      error,
    )

    databaseError = true
  }

  const calendarRecords = studyDays.map((day) => ({
    studyDate: day.studyDate,
    sessions: day.sessions,
    focusMinutes: day.focusMinutes,
  }))

  return (
    <main className="min-h-screen w-full px-5 py-5 md:px-8 md:py-6 lg:px-10">
      <header className="mx-auto mb-5 max-w-7xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Produtividade
        </p>

        <h1 className="mt-1 font-serif text-4xl text-foreground md:text-5xl">
          Pomodoro
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Controle suas sessões de foco e acompanhe sua
          rotina de estudos.
        </p>
      </header>

      {databaseError ? (
        <section className="mx-auto max-w-4xl rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <h2 className="font-semibold text-red-400">
            Não foi possível consultar o Neon.
          </h2>

          <p className="mt-2 text-sm text-red-300/80">
            Verifique o terminal do VS Code para visualizar
            o erro completo.
          </p>
        </section>
      ) : (
        <div className="mx-auto grid max-w-7xl items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Lado esquerdo */}
          <StudyCalendar
            records={calendarRecords}
          />

          {/* Lado direito */}
          <PomodoroTimer />
        </div>
      )}
    </main>
  )
}