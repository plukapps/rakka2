"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/stores/appStore"
import { useAnimals } from "@/hooks/useAnimals"
import { useAlerts } from "@/hooks/useAlerts"
import { activityRepository } from "@/lib/repositories/activity"
import { animalRepository } from "@/lib/repositories/animal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { TagView } from "@/components/animals/TagView"
import { useLots } from "@/hooks/useLots"
import { formatDate, formatCaravana, activityTypeLabel, categoryLabel, formatWeight, formatGdp, cn } from "@/lib/utils"
import { calculateLotWeightStats } from "@/lib/gdp"

const quickActions = [
  {
    href: "/activities/new/reading",
    label: "Registrar Lectura",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/activities/new",
    label: "Nueva Actividad",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/lots",
    label: "Ver lotes",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/animals",
    label: "Stock Animales",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 5.4-5 7-5 11a5 5 0 0010 0c0-4-3.8-5.6-5-11z" />
      </svg>
    ),
  },
]

const urgencyVariant: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info",
}

const activityTypeVariant: Record<string, "success" | "info" | "warning" | "neutral"> = {
  sanitary: "success",
  commercial: "warning",
  field_control: "info",
  movement: "neutral",
  reproduction: "info",
  general: "neutral",
}

export default function HomePage() {
  const router = useRouter()
  const activeEst = useAppStore((s) => s.activeEstablishment)
  const estId = activeEst?.id
  const animals = useAnimals()
  const lots = useLots()
  const { alerts } = useAlerts()

  // Search state
  const [search, setSearch] = useState("")
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Recent activities
  const recentActivities = useMemo(() => {
    if (!estId) return []
    return activityRepository.getAll(estId).slice(0, 5)
  }, [estId])

  // Next actions (alerts)
  const nextAlerts = useMemo(() => alerts.slice(0, 3), [alerts])

  // Animal search
  const searchResults = useMemo(() => {
    if (!search.trim() || !estId) return []
    const q = search.toLowerCase()
    return animalRepository
      .getAll(estId)
      .filter((a) => {
        const formatted = formatCaravana(a.caravana, "serie").toLowerCase()
        return (
          a.caravana.toLowerCase().includes(q) ||
          formatted.includes(q)
        )
      })
      .slice(0, 8)
  }, [search, estId])

  const activeAnimals = useMemo(
    () => animals.filter((a) => a.status === "active"),
    [animals]
  )

  // Empty state — no animals
  if (activeAnimals.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold text-foreground">{activeEst?.name ?? "Inicio"}</h1>
        <EmptyState
          title="No hay animales en este establecimiento"
          description="Ingresa tu primer animal para comenzar a gestionar tu rodeo."
          action={
            <Link href="/animals/new">
              <Button>Ingresar primer animal</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <h1 className="text-lg font-semibold text-foreground">{activeEst?.name ?? "Inicio"}</h1>

      {/* Global search */}
      <div ref={searchRef} className="relative space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Búsqueda Rápida</h2>
        <Input
          placeholder="Buscar animal por caravana..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setShowResults(true)
          }}
          onFocus={() => setShowResults(true)}
        />
        {showResults && search.trim() && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
            {searchResults.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto py-1">
                {searchResults.map((animal) => (
                  <li key={animal.id}>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
                      onClick={() => {
                        setShowResults(false)
                        setSearch("")
                        router.push(`/animals/${animal.id}`)
                      }}
                    >
                      <TagView caravana={animal.caravana} size="sm" />
                      <span className="text-sm text-muted-foreground">{categoryLabel(animal.category)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="border-b border-border" />

      {/* Quick access buttons */}
      <div className="space-y-2">
      <h2 className="text-sm font-semibold text-foreground">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors hover:bg-muted/50">
              <span className="text-muted-foreground">{action.icon}</span>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>
      </div>

      {/* Recent activity */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Actividad reciente</h2>
        {recentActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividades registradas.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {recentActivities.map((act) => (
              <Link
                key={act.id}
                href={`/activities/${act.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge variant={activityTypeVariant[act.type] ?? "neutral"}>
                    {activityTypeLabel(act.type)}
                  </StatusBadge>
                  <span className="text-sm text-foreground">
                    {act.animalIds.length} {act.animalIds.length === 1 ? "animal" : "animales"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{act.responsible}</span>
                  <span>{formatDate(act.activityDate)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Lot weight summary */}
      {lots.length > 0 && (() => {
        const lotsWithStats = lots
          .filter((l) => l.status === "active")
          .map((l) => {
            const lotAnimals = activeAnimals.filter((a) => a.lotId === l.id)
            const stats = calculateLotWeightStats(lotAnimals)
            return { lot: l, stats }
          })
          .filter(({ stats }) => stats.animalsWithWeight > 0)

        if (lotsWithStats.length === 0) return null

        return (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Resumen de lotes</h2>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {lotsWithStats.map(({ lot: l, stats }) => (
                <Link
                  key={l.id}
                  href={`/lots/${l.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.animalsWithWeight} animales · {formatWeight(stats.avgWeight)} prom.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatGdp(stats.avgGdpRecent)}
                    </p>
                    {stats.lastWeightDate && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(stats.lastWeightDate)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })()}

      {/* Next actions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Proximas acciones</h2>
          <Link href="/alerts">
            <Button variant="ghost" size="sm">Ver todas</Button>
          </Link>
        </div>
        {nextAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin alertas pendientes.</p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {nextAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <StatusBadge variant={urgencyVariant[alert.urgency] ?? "neutral"}>
                    {alert.urgency === "critical" ? "Critica" : alert.urgency === "warning" ? "Advertencia" : "Info"}
                  </StatusBadge>
                  <span className="text-sm text-foreground">{alert.description}</span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(alert.relevantDate)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
