"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, KanbanSquare, Map } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/kanban", label: "Kanban", icon: KanbanSquare },
  { href: "/roadmap", label: "Roadmap", icon: Map },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="sticky top-0 flex h-screen w-16 flex-col border-r border-sidebar-border bg-sidebar py-6 md:w-56">
      <div className="mb-8 px-4 md:px-6">
        <span className="hidden font-serif text-2xl leading-none text-foreground md:block">
          Meu Foco
        </span>
        <span className="mx-auto block h-8 w-8 rounded-md bg-foreground/10 text-center font-serif text-lg leading-8 text-foreground md:hidden">
          F
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 md:px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                "justify-center md:justify-start",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
