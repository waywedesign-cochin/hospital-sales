import { createStore } from "zustand/vanilla";
import { User, Clinic } from "@/lib/types";
import {
  logoutAction,
  signInAction,
  signUpAction,
} from "@/app/actions/authActions";

export interface OrganizationOption {
  _id: string;
  name: string;
  slug: string;
}

export type SignInResult =
  | User
  | { requiresOrgSelection: true; organizations: OrganizationOption[] };

export interface AuthState {
  user: User | null;
  clinic: Clinic | null;
  isLoading: boolean;
  signin: (
    email: string,
    password: string,
    organizationId?: string,
  ) => Promise<SignInResult>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchClinic: () => Promise<void>;
}

export const createAuthStore = () =>
  createStore<AuthState>((set) => ({
    user: null,
    clinic: null,
    isLoading: false,

    setUser: (user) => set({ user }),

    fetchClinic: async () => {
      try {
        const res = await fetch("/api/organization");
        const data = await res.json();
        if (data.success) {
          set({ clinic: data.data });
        }
      } catch (error) {
        console.error("Failed to fetch clinic", error);
      }
    },

    // ================= SIGN IN =================
    signin: async (email, password, organizationId) => {
      set({ isLoading: true });

      try {
        const response = await signInAction({
          email,
          password,
          organizationId,
        });

        // "in" narrows the union; a plain property-access check
        // (response.data?.requiresOrgSelection) does not, since
        // TS won't let you read a field that's missing on one
        // branch of the union even behind optional chaining.
        if (response.data && "requiresOrgSelection" in response.data) {
          set({ isLoading: false });
          return {
            requiresOrgSelection: true,
            organizations: response.data.organizations,
          };
        }

        if (!response.success) {
          throw new Error(response.message);
        }

        const user = response.data as User;
        set({
          user: user,
          isLoading: false,
        });
        return user;
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
