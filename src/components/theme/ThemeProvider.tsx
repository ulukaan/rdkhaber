"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "light" | "dark";

const STORAGE_KEY = "rdk_theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
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
  const [theme, setTheme] = useState<Theme>("light");

  useLayoutEffect(() => {
    if (staff) {
      document.documentElement.removeAttribute("data-theme");
      return;
    }
    const next = readStoredTheme();
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, [staff]);

  const toggle = () => {
    if (staff) return;
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme: staff ? "light" : theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
