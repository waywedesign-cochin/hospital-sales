import { createStore } from "zustand/vanilla";
import { User } from "@/lib/types";
import {
  logoutAction,
  signInAction,
  signUpAction,
} from "@/app/actions/authActions";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<void>;
  signout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const createAuthStore = () =>
  createStore<AuthState>((set) => ({
    user: null,
    isLoading: false,

    setUser: (user) => set({ user }),

    // ================= SIGN IN =================
    signin: async (email, password) => {
      set({ isLoading: true });

      try {
        const response = await signInAction({ email, password });

        if (!response.success) {
          throw new Error(response.message);
        }

        set({
          user: response.data as User,
          isLoading: false,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    // ================= SIGN UP =================
    signup: async (firstName, lastName, email, password) => {
      set({ isLoading: true });

      try {
        const response = await signUpAction({
          firstName,
          lastName,
          email,
          password,
        });

        if (!response.success) {
          throw new Error(response.message);
        }

        set({ isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    // ================= SIGN OUT =================
    signout: async () => {
      await logoutAction();
      set({ user: null });
    },
  }));
