"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { Animal, Activity } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { calculateLotWeightStats, getLotWeightEvolution, projectDaysToTarget } from "@/lib/gdp"
import { formatWeight, formatGdp, formatDate } from "@/lib/utils"

interface LotWeightStatsCardProps {
  animals: Animal[]
  activities: Activity[]
}

export function LotWeightStatsCard({ animals, activities }: LotWeightStatsCardProps) {
  const [targetWeight, setTargetWeight] = useState("")

  const stats = useMemo(() => calculateLotWeightStats(animals), [animals])

  const evolution = useMemo(
    () => getLotWeightEvolution(activities, animals.map((a) => a.id)),
    [activities, animals]
  )

  const chartData = useMemo(
    () =>
      evolution.map((p) => ({
        date: p.date,
        label: formatDate(p.date),
        peso: p.avgWeight,
      })),
    [evolution]
  )

  // Projection
  const target = parseFloat(targetWeight)
  const projectionDays =
    !isNaN(target) && stats.avgWeight && stats.avgGdpRecent
      ? projectDaysToTarget(stats.avgWeight, stats.avgGdpRecent, target)
      : null
  const projectionDate = projectionDays != null ? Date.now() + projectionDays * 86400000 : null

  if (stats.animalsWithWeight === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadisticas de peso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Peso promedio</p>
            <p className="text-lg font-semibold text-foreground">{formatWeight(stats.avgWeight)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rango</p>
            <p className="text-sm font-medium text-foreground">
              {formatWeight(stats.minWeight)} — {formatWeight(stats.maxWeight)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Con peso</p>
            <p className="text-sm font-medium text-foreground">
              {stats.animalsWithWeight} / {stats.totalAnimals}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GDP Reciente prom.</p>
            <p className="text-lg font-semibold text-foreground">
              {formatGdp(stats.avgGdpRecent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GDP Acumulada prom.</p>
            <p className="text-sm font-medium text-foreground">
              {formatGdp(stats.avgGdpAccumulated)}
            </p>
          </div>
          {stats.lastWeightDate && (
            <div>
              <p className="text-xs text-muted-foreground">Ultimo pesaje</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(stats.lastWeightDate)}
              </p>
            </div>
          )}
        </div>

        {/* Evolution chart */}
        {chartData.length >= 2 && (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 20", "dataMax + 20"]}
                  unit=" kg"
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                  }}
                  formatter={(value) => [`${value} kg`, "Peso prom."]}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--primary)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Projection calculator */}
        <div className="rounded-lg border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Proyeccion a peso objetivo
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder="Peso objetivo (kg)"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-48"
            />
            {targetWeight && (
              <p className="text-sm text-foreground">
                {projectionDays != null && projectionDate != null ? (
                  <>
                    Estimado:{" "}
                    <span className="font-semibold">
                      {projectionDays} dias ({formatDate(projectionDate)})
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    No se puede proyectar con la GDP actual.
                  </span>
                )}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            La proyeccion usa la GDP reciente promedio del lote.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
