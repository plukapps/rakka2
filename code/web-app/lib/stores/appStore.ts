"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Establishment } from "@/lib/types";
import { MOCK_ESTABLISHMENTS } from "@/lib/mock/data";

interface AppState {
  activeEstablishment: Establishment | null;
  establishments: Establishment[];
  setActiveEstablishment: (est: Establishment) => void;
  loadEstablishments: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeEstablishment: MOCK_ESTABLISHMENTS[0],
      establishments: MOCK_ESTABLISHMENTS,

      setActiveEstablishment: (est: Establishment) => {
        set({ activeEstablishment: est });
      },

      loadEstablishments: () => {
        set({ establishments: MOCK_ESTABLISHMENTS });
      },
    }),
    {
      name: "rakka-app",
      partialize: (state) => ({
        activeEstablishment: state.activeEstablishment,
      }),
    }
  )
);
