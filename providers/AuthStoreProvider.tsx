"use client";

import { ReactNode, useState, createContext, useContext, useEffect } from "react";
import { StoreApi } from "zustand";
import { useStore } from "zustand";
import { createAuthStore, AuthState } from "@/stores/authStore";
import { getCurrentUserAction } from "@/app/actions/userActions";

const AuthStoreContext = createContext<StoreApi<AuthState> | null>(null);

export function AuthStoreProvider({ children }: { children: ReactNode }) {
  // Lazy initialiser runs once, same as the previous ref-assignment-during-render
  // pattern, but without reading/writing a ref while rendering.
  const [store] = useState<StoreApi<AuthState>>(() => createAuthStore());

  // ✅ REHYDRATE USER ON APP LOAD
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getCurrentUserAction();

        if (res?.success) {
          store.setState({
            user: res.data,
          });
        }
      } catch {
        console.log("No active session");
      }
    };

    initAuth();
  }, [store]);

  return (
    <AuthStoreContext.Provider value={store}>
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
