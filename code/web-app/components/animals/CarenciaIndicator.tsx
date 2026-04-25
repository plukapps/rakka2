import { cn, carenciaLabel, daysUntil } from "@/lib/utils";
import type { Animal } from "@/lib/types";

interface CarenciaIndicatorProps {
  animal: Animal;
  size?: "sm" | "md";
}

export function CarenciaIndicator({ animal, size = "md" }: CarenciaIndicatorProps) {
  if (!animal.hasActiveCarencia || !animal.carenciaExpiresAt) {
    return null;
  }

  const days = daysUntil(animal.carenciaExpiresAt);
  const isCritical = days <= 3;
  const isWarning = days <= 7;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[4px] font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        isCritical
          ? "bg-red-100 text-red-700"
          : isWarning
          ? "bg-amber-100 text-amber-700"
          : "bg-blue-100 text-blue-700"
      )}
    >
      {size !== "sm" && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-blue-500"
          )}
        />
      )}
      {carenciaLabel(animal.carenciaExpiresAt, size === "sm")}
    </span>
  );
}
