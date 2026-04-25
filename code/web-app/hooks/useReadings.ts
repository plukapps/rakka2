"use client"

import { useState, useEffect, useCallback } from "react"
import type { ReadingActivity } from "@/lib/types"
import { activityRepository } from "@/lib/repositories/activity"
import { useAppStore } from "@/lib/stores/appStore"

export function useReadings() {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [readings, setReadings] = useState<ReadingActivity[]>([])

  const load = useCallback(() => {
    if (!estId) return
    const all = activityRepository.getAll(estId)
    setReadings(all.filter((a): a is ReadingActivity => a.type === "reading"))
  }, [estId])

  useEffect(() => {
    load()
    if (!estId) return
    return activityRepository.subscribe(estId, load)
  }, [estId, load])

  return readings
}
