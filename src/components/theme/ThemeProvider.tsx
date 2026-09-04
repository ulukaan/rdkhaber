"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

const STORAGE_KEY = "rdk_theme";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}>({
  theme: "light",
  toggle: () => {},
  setTheme: () => {},
});

function isStaffPath(path: string) {
  return path.startsWith("/admin") || path.startsWith("/editor");
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const staff = isStaffPath(pathname);
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());

  useLayoutEffect(() => {
    if (staff) {
      document.documentElement.removeAttribute("data-theme");
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [staff, theme]);

  const applyTheme = (next: Theme) => {
    if (staff) return;
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    setThemeState(next);
  };

  const toggle = () => {
    if (staff) return;
    setThemeState((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{ theme: staff ? "light" : theme, toggle, setTheme: applyTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
