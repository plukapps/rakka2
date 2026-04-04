"use client";

import { useAppStore } from "@/lib/stores/appStore";

export function useEstablishment() {
  const activeEstablishment = useAppStore((s) => s.activeEstablishment);
  const establishments = useAppStore((s) => s.establishments);
  const setActiveEstablishment = useAppStore((s) => s.setActiveEstablishment);

  return { activeEstablishment, establishments, setActiveEstablishment };
}
