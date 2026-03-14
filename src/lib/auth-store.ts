import { create } from "zustand";
import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

interface AuthStore {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Restore existing session on init
  supabase.auth.getSession().then(({ data: { session } }) => {
    set({ user: session?.user ?? null, loading: false });
  });

  // Keep user in sync with auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ user: session?.user ?? null });
  });

  return {
    user: null,
    loading: true,

    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Sign-in failed:", error);
        throw error;
      }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign-out failed:", error);
        throw error;
      }
    },
  };
});
