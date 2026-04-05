"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { Animal, Activity } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { getWeightHistory, calculateGdp } from "@/lib/gdp"
import { formatWeight, formatGdp, formatDate } from "@/lib/utils"

interface WeightHistoryCardProps {
  animal: Animal
  activities: Activity[]
}

export function WeightHistoryCard({ animal, activities }: WeightHistoryCardProps) {
  const [showList, setShowList] = useState(false)

  const history = useMemo(
    () => getWeightHistory(activities, animal.id, animal.entryWeight, animal.entryDate),
    [activities, animal.id, animal.entryWeight, animal.entryDate]
  )

  const chartData = useMemo(
    () =>
      history.map((p) => ({
        date: p.date,
        label: formatDate(p.date),
        peso: p.weight,
      })),
    [history]
  )

  // No weight data at all
  if (history.length <= 1 && animal.lastWeight == null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de peso</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin pesajes individuales registrados. La GDP se calcula cuando hay pesos por animal.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de peso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Último peso</p>
            <p className="text-lg font-semibold text-foreground">
              {formatWeight(animal.lastWeight)}
            </p>
            {animal.lastWeightDate && (
              <p className="text-xs text-muted-foreground">{formatDate(animal.lastWeightDate)}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GDP Reciente</p>
            <p className="text-lg font-semibold text-foreground">
              {formatGdp(animal.gdpRecent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">GDP Acumulada</p>
            <p className="text-lg font-semibold text-foreground">
              {formatGdp(animal.gdpAccumulated)}
            </p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length >= 2 && (
          <div className="h-[200px] w-full">
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
                  formatter={(value) => [`${value} kg`, "Peso"]}
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

        {/* Weighing list toggle */}
        {history.length > 1 && (
          <div>
            <button
              type="button"
              onClick={() => setShowList(!showList)}
              className="text-xs text-primary hover:underline"
            >
              {showList ? "Ocultar detalle" : `Ver ${history.length} pesajes`}
            </button>

            {showList && (
              <div className="mt-2 space-y-1">
                {[...history].reverse().map((point, idx) => {
                  const prev = history[history.length - 1 - idx - 1]
                  const gdp = prev
                    ? calculateGdp(prev.weight, point.weight, prev.date, point.date)
                    : null
                  return (
                    <div
                      key={point.activityId ?? "entry"}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium text-foreground">
                          {formatWeight(point.weight)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatDate(point.date)}
                        </span>
                        {!point.activityId && (
                          <span className="ml-2 text-xs text-muted-foreground italic">
                            (ingreso)
                          </span>
                        )}
                      </div>
                      {gdp != null && (
                        <span
                          className={`text-xs font-medium ${
                            gdp >= 0 ? "text-emerald-600" : "text-red-500"
                          }`}
                        >
                          {gdp >= 0 ? "+" : ""}
                          {formatGdp(gdp)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
