"use client";

import { ReactNode, useRef, createContext, useContext, useEffect } from "react";
import { StoreApi } from "zustand";
import { useStore } from "zustand";
import { createAuthStore, AuthState } from "@/stores/authStore";
import { getCurrentUserAction } from "@/app/actions/userActions";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<StoreApi<AuthState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAuthStore();
  }

  // ✅ REHYDRATE USER ON APP LOAD
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getCurrentUserAction();

        if (res?.success) {
          storeRef.current?.setState({
            user: res.data,
          });
        }
      } catch (error) {
        console.log("No active session");
      }
    };

    initAuth();
  }, []);

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      {children}
    </AuthStoreContext.Provider>
  );
}

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);

  if (!store) {
    throw new Error("Missing AuthStoreProvider");
  }

  return useStore(store, selector);
}
