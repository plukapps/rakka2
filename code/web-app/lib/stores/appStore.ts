"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Establishment } from "@/lib/types";
import { MOCK_ESTABLISHMENTS } from "@/lib/mock/data";
import { getMockStore } from "@/lib/mock/store";
import { generateId, now } from "@/lib/utils";

interface AppState {
  activeEstablishment: Establishment | null;
  establishments: Establishment[];
  setActiveEstablishment: (est: Establishment) => void;
  loadEstablishments: () => void;
  createEstablishment: (input: { name: string; description: string; location: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeEstablishment: MOCK_ESTABLISHMENTS[0],
      establishments: MOCK_ESTABLISHMENTS,

      setActiveEstablishment: (est: Establishment) => {
        set({ activeEstablishment: est });
      },

      loadEstablishments: () => {
        set({ establishments: MOCK_ESTABLISHMENTS });
      },

      createEstablishment: (input: { name: string; description: string; location: string }) => {
        const store = getMockStore();
        const id = generateId("est");
        const est: Establishment = {
          id,
          name: input.name,
          description: input.description,
          location: input.location,
          ownerId: "user_001",
          status: "active",
          createdAt: now(),
        };
        store.setEstablishment(est);
        set({
          activeEstablishment: est,
          establishments: [...get().establishments, est],
        });
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
