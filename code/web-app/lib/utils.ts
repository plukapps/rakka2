import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID generation (mock — in production Firebase pushes generate IDs)
export function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

// Timestamp helpers
export function now(): number {
  return Date.now()
}

export function toTimestamp(date: Date): number {
  return date.getTime()
}

export function fromTimestamp(ts: number): Date {
  return new Date(ts)
}

// Date formatting
export function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(ts))
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts))
}

export function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Hoy"
  if (days === 1) return "Ayer"
  if (days < 7) return `Hace ${days} días`
  return formatDate(ts)
}

// Carencia helpers
export function daysUntil(ts: number): number {
  const diff = ts - Date.now()
  return Math.ceil(diff / 86400000)
}

export function isCarenciaExpiringSoon(carenciaExpiresAt: number | null): boolean {
  if (!carenciaExpiresAt) return false
  return daysUntil(carenciaExpiresAt) <= 7
}

export function carenciaLabel(carenciaExpiresAt: number | null, short = false): string {
  if (!carenciaExpiresAt) return "Sin carencia"
  const days = daysUntil(carenciaExpiresAt)
  if (short) {
    if (days < 0) return "v."
    if (days === 0) return "hoy"
    return `v ${days}d`
  }
  if (days < 0) return "Carencia vencida"
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `Vence en ${days} días`
}

// Caravana formatting
// Storage: 15 raw digits — CCC(country) FFF(fixed zeros) SSSSS(serie) NNNN(num)
// Display modes: full | short | serie

export type CaravanaMode = "full" | "short" | "serie"

export function formatCaravana(caravana: string, mode: CaravanaMode = "serie"): string {
  if (caravana.length !== 15) return caravana
  switch (mode) {
    case "full":
      return caravana
    case "short":
      return caravana.slice(6)
    case "serie":
      return `${caravana.slice(6, 11)} ${caravana.slice(11)}`
  }
}

export function caravanaParts(caravana: string) {
  return {
    country: caravana.slice(0, 3),
    fixed: caravana.slice(3, 6),
    serie: caravana.slice(6, 11),
    num: caravana.slice(11),
  }
}

// RFID file parsing
// Format: [|A0000000858000054596559|15082023|113716|T33333|.|...|]
// Extracts last 15 digits from the first pipe-separated field
export function parseRfidLine(line: string): string | null {
  const fields = line.replace(/^\[/, "").replace(/\]$/, "").split("|").filter(Boolean)
  if (fields.length === 0) return null
  const raw = fields[0].replace(/\D/g, "")
  if (raw.length < 15) return null
  return raw.slice(-15)
}

// Extended RFID parsing that also extracts weight from CSV format.
// Handles bracket-pipe format (no weight) and CSV: "caravana,weight" or "caravana;weight"
export function parseRfidLineWithWeight(
  line: string
): { caravana: string; weight: number | null } | null {
  // Try bracket pipe format first
  const fromBracket = parseRfidLine(line)
  if (fromBracket) return { caravana: fromBracket, weight: null }

  // Try CSV format (comma or semicolon separated)
  const trimmed = line.trim()
  const sep = trimmed.includes(",") ? "," : trimmed.includes(";") ? ";" : null

  if (sep) {
    const parts = trimmed.split(sep)
    const raw = parts[0].trim().replace(/\D/g, "")
    if (raw.length < 15) return null
    const caravana = raw.slice(-15)
    const weightStr = parts[1]?.trim()
    const weight = weightStr ? parseFloat(weightStr) : null
    return { caravana, weight: weight != null && !isNaN(weight) ? weight : null }
  }

  // Plain digits only
  const raw = trimmed.replace(/\D/g, "")
  if (raw.length === 15) return { caravana: raw, weight: null }
  return null
}

// Label helpers
export function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    vaca: "Vaca",
    toro: "Toro",
    ternero: "Ternero",
    ternera: "Ternera",
    vaquillona: "Vaquillona",
    novillo: "Novillo",
    otro: "Otro",
  }
  return labels[cat] ?? cat
}

export function activityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    reading: "Lectura",
    stock_entry: "Ingreso de stock",
    sanitary: "Sanitaria",
    commercial: "Comercial",
    field_control: "Control de campo",
    movement: "Movimiento",
    reproduction: "Reproducción",
    general: "General",
  }
  return labels[type] ?? type
}

export function formatWeight(kg: number | null): string {
  if (kg == null) return "—"
  return `${kg % 1 === 0 ? kg : kg.toFixed(1)} kg`
}

export function formatGdp(gdp: number | null): string {
  if (gdp == null) return "—"
  return `${gdp.toFixed(2)} kg/día`
}

export function urgencyLabel(urgency: string): string {
  const labels: Record<string, string> = {
    info: "Info",
    warning: "Advertencia",
    critical: "Crítica",
  }
  return labels[urgency] ?? urgency
}
