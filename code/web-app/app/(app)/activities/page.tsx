"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { activityRepository } from "@/lib/repositories/activity";
import { useAppStore } from "@/lib/stores/appStore";
import type { Activity } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, activityTypeLabel } from "@/lib/utils";

const urgencyMap: Record<string, "default" | "success" | "warning" | "destructive" | "info"> = {
  sanitary: "warning",
  commercial: "destructive",
  field_control: "info",
  movement: "default",
  reproduction: "success",
  general: "default",
};

export default function ActivitiesPage() {
  const estId = useAppStore((s) => s.activeEstablishment?.id);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!estId) return;
    setActivities(activityRepository.getAll(estId));
    return activityRepository.subscribe(estId, () =>
      setActivities(activityRepository.getAll(estId))
    );
  }, [estId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Actividades</h1>
        <Link href="/activities/new">
          <Button size="sm">+ Registrar</Button>
        </Link>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="Sin actividades"
          description="No hay actividades registradas."
        />
      ) : (
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Badge variant={urgencyMap[act.type] ?? "default"}>
                  {activityTypeLabel(act.type)}
                </Badge>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {act.animalIds.length} animal{act.animalIds.length !== 1 ? "es" : ""}
                  </p>
                  <p className="text-xs text-gray-500">{act.responsible}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">{formatDate(act.activityDate)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
