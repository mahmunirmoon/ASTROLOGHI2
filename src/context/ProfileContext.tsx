import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { APP_CONFIG } from "../lib/config";
import type { UserBirthData } from "../types";

interface Toast {
  message: string;
  tone: "success" | "error" | "info";
}

interface ProfileContextValue {
  birthData: UserBirthData | null;
  hasProfile: boolean;
  saveBirthData: (data: UserBirthData) => void;
  clearBirthData: () => void;
  toast: Toast | null;
  showToast: (message: string, tone?: Toast["tone"]) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

const readStored = (): UserBirthData | null => {
  try {
    const raw = localStorage.getItem(APP_CONFIG.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserBirthData;
    if (!parsed?.location || typeof parsed.gYear !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [birthData, setBirthData] = useState<UserBirthData | null>(() => readStored());
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const saveBirthData = useCallback((data: UserBirthData) => {
    setBirthData(data);
    try {
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(data));
    } catch {
      /* storage unavailable — session-only profile */
    }
  }, []);

  const clearBirthData = useCallback(() => {
    setBirthData(null);
    try {
      localStorage.removeItem(APP_CONFIG.storageKey);
    } catch {
      /* noop */
    }
  }, []);

  const showToast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    setToast({ message, tone });
  }, []);

  const value = useMemo(
    () => ({
      birthData,
      hasProfile: !!birthData,
      saveBirthData,
      clearBirthData,
      toast,
      showToast,
    }),
    [birthData, saveBirthData, clearBirthData, toast, showToast],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = (): ProfileContextValue => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
};
