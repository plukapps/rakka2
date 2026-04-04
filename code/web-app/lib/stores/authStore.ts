"use client";

import { create } from "zustand";
import type { User } from "@/lib/types";
import { MOCK_USER } from "@/lib/mock/data";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  signIn: async (_email: string, _password: string) => {
    set({ isLoading: true });
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 500));
    // Mock: accept any credentials
    set({ user: MOCK_USER, isLoading: false });
  },

  signOut: () => {
    set({ user: null });
  },
}));
