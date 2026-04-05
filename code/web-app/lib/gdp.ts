import type { Activity, Animal, FieldControlActivity } from "@/lib/types"

// --- Types ---

export interface WeightDataPoint {
  date: number
  weight: number
  activityId: string | null // null for entry weight
}

export interface LotWeightStats {
  avgWeight: number | null
  minWeight: number | null
  maxWeight: number | null
  avgGdpRecent: number | null
  avgGdpAccumulated: number | null
  animalsWithWeight: number
  totalAnimals: number
  lastWeightDate: number | null
}

// --- Core GDP calculation ---

export function calculateGdp(
  weightBefore: number,
  weightAfter: number,
  dateBefore: number,
  dateAfter: number
): number | null {
  const days = (dateAfter - dateBefore) / 86400000
  if (days <= 0) return null
  return (weightAfter - weightBefore) / days
}

// --- Weight history for a single animal ---

export function getWeightHistory(
  activities: Activity[],
  animalId: string,
  entryWeight: number | null,
  entryDate: number
): WeightDataPoint[] {
  const points: WeightDataPoint[] = []

  if (entryWeight != null) {
    points.push({ date: entryDate, weight: entryWeight, activityId: null })
  }

  for (const act of activities) {
    if (act.type !== "field_control") continue
    const fc = act as FieldControlActivity
    if (fc.subtype !== "weighing" || !fc.weightsByAnimal) continue
    const w = fc.weightsByAnimal[animalId]
    if (w == null) continue
    points.push({ date: act.activityDate, weight: w, activityId: act.id })
  }

  return points.sort((a, b) => a.date - b.date)
}

// --- Projection ---

export function projectDaysToTarget(
  currentWeight: number,
  gdpPerDay: number,
  targetWeight: number
): number | null {
  if (gdpPerDay <= 0 || targetWeight <= currentWeight) return null
  return Math.ceil((targetWeight - currentWeight) / gdpPerDay)
}

export function projectDateToTarget(
  currentWeight: number,
  gdpPerDay: number,
  targetWeight: number
): number | null {
  const days = projectDaysToTarget(currentWeight, gdpPerDay, targetWeight)
  if (days == null) return null
  return Date.now() + days * 86400000
}

// --- Lot-level stats (from denormalized animal fields) ---

export function calculateLotWeightStats(animals: Animal[]): LotWeightStats {
  const withWeight = animals.filter((a) => a.lastWeight != null)
  const totalAnimals = animals.length

  if (withWeight.length === 0) {
    return {
      avgWeight: null,
      minWeight: null,
      maxWeight: null,
      avgGdpRecent: null,
      avgGdpAccumulated: null,
      animalsWithWeight: 0,
      totalAnimals,
      lastWeightDate: null,
    }
  }

  const weights = withWeight.map((a) => a.lastWeight!)
  const avgWeight = weights.reduce((s, w) => s + w, 0) / weights.length
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)

  const withGdpRecent = withWeight.filter((a) => a.gdpRecent != null)
  const avgGdpRecent =
    withGdpRecent.length > 0
      ? withGdpRecent.reduce((s, a) => s + a.gdpRecent!, 0) / withGdpRecent.length
      : null

  const withGdpAccum = withWeight.filter((a) => a.gdpAccumulated != null)
  const avgGdpAccumulated =
    withGdpAccum.length > 0
      ? withGdpAccum.reduce((s, a) => s + a.gdpAccumulated!, 0) / withGdpAccum.length
      : null

  const lastWeightDate = Math.max(...withWeight.map((a) => a.lastWeightDate!))

  return {
    avgWeight: Math.round(avgWeight * 10) / 10,
    minWeight,
    maxWeight,
    avgGdpRecent: avgGdpRecent != null ? Math.round(avgGdpRecent * 100) / 100 : null,
    avgGdpAccumulated: avgGdpAccumulated != null ? Math.round(avgGdpAccumulated * 100) / 100 : null,
    animalsWithWeight: withWeight.length,
    totalAnimals,
    lastWeightDate,
  }
}

// --- Lot weight evolution over time ---

export function getLotWeightEvolution(
  activities: Activity[],
  animalIds: string[]
): { date: number; avgWeight: number; animalCount: number }[] {
  const animalSet = new Set(animalIds)
  const points: { date: number; avgWeight: number; animalCount: number }[] = []

  for (const act of activities) {
    if (act.type !== "field_control") continue
    const fc = act as FieldControlActivity
    if (fc.subtype !== "weighing" || !fc.weightsByAnimal) continue

    const relevant = Object.entries(fc.weightsByAnimal).filter(([id]) => animalSet.has(id))
    if (relevant.length === 0) continue

    const avg = relevant.reduce((s, [, w]) => s + w, 0) / relevant.length
    points.push({
      date: act.activityDate,
      avgWeight: Math.round(avg * 10) / 10,
      animalCount: relevant.length,
    })
  }

  return points.sort((a, b) => a.date - b.date)
}
