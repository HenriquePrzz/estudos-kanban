import { getMilestones } from "@/app/actions/milestones"
import { RoadmapTimeline } from "@/components/roadmap-timeline"
import { connection } from "next/server"

export default async function RoadmapPage() {
  // Impede que o banco seja consultado durante o build
  await connection()

  const milestones = await getMilestones()

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Roadmap
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Seus marcos em uma linha do tempo. Clique no indicador para mudar o status.
        </p>
      </header>

      <RoadmapTimeline initialMilestones={milestones} />
    </div>
  )
}