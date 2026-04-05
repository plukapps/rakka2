"use client";

import { useEstablishment } from "@/hooks/useEstablishment";

export function EstablishmentSelector() {
  const { activeEstablishment, establishments, setActiveEstablishment } =
    useEstablishment();

  if (establishments.length <= 1) {
    return (
      <span className="text-sm font-medium text-foreground">
        {activeEstablishment?.name ?? "Sin establecimiento"}
      </span>
    );
  }

  return (
    <select
      value={activeEstablishment?.id ?? ""}
      onChange={(e) => {
        const est = establishments.find((x) => x.id === e.target.value);
        if (est) setActiveEstablishment(est);
      }}
      className="h-8 rounded-md border border-border bg-muted px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      {establishments.map((est) => (
        <option key={est.id} value={est.id}>
          {est.name}
        </option>
      ))}
    </select>
  );
}
