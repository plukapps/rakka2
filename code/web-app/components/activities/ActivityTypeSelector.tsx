"use client"

import Link from "next/link"
import type { ActivityType } from "@/lib/types"
import type { LucideIcon } from "lucide-react"
import { Radio, Syringe, HandCoins, ClipboardCheck, ArrowRightLeft, Heart, FileText } from "lucide-react"

interface ActivityOption {
  type: ActivityType
  label: string
  icon: LucideIcon
  href: string
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  { type: "reading", label: "Lectura", icon: Radio, href: "/activities/new/reading" },
  { type: "sanitary", label: "Sanitaria", icon: Syringe, href: "/activities/new/sanitary" },
  { type: "commercial", label: "Comercial", icon: HandCoins, href: "/activities/new/commercial" },
  { type: "field_control", label: "Control de campo", icon: ClipboardCheck, href: "/activities/new/field-control" },
  { type: "movement", label: "Movimiento", icon: ArrowRightLeft, href: "/activities/new/movement" },
  { type: "general", label: "General", icon: FileText, href: "/activities/new/general" },
]

export function ActivityTypeSelector() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ACTIVITY_OPTIONS.map((opt) => (
        <Link
          key={opt.type}
          href={opt.href}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-6 text-center transition-colors hover:border-primary/30 hover:bg-muted"
        >
          <opt.icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground">{opt.label}</span>
        </Link>
      ))}
    </div>
  )
}
