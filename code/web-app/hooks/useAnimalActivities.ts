"use client"

import { useState, useEffect, useCallback } from "react"
import type { Activity } from "@/lib/types"
import { activityRepository } from "@/lib/repositories/activity"
import { useAppStore } from "@/lib/stores/appStore"

export function useAnimalActivities(animalId: string | undefined) {
  const estId = useAppStore((s) => s.activeEstablishment?.id)
  const [activities, setActivities] = useState<Activity[]>([])

  const load = useCallback(() => {
    if (!estId || !animalId) return
    setActivities(activityRepository.getByAnimal(estId, animalId))
  }, [estId, animalId])

  useEffect(() => {
    load()
    if (!estId) return
    return activityRepository.subscribe(estId, load)
  }, [estId, load])

  return activities
}
