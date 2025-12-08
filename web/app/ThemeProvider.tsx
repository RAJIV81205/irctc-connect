"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (event?: MouseEvent<HTMLElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // Initial theme (localStorage / system)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = (event?: MouseEvent<HTMLElement>) => {
    const toTheme: Theme = theme === "light" ? "dark" : "light";

    if (typeof window === "undefined" || typeof document === "undefined") {
      // Fallback: no animation
      setTheme(toTheme);
      localStorage.setItem("theme", toTheme);
      if (toTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return;
    }

    // ----- CREATE OVERLAY -----
    const overlay = document.createElement("div");
    overlay.className = `theme-circle-overlay theme-circle-overlay--${toTheme}`;
    document.body.appendChild(overlay);

    // Origin = button center (fallback to screen center)
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (event) {
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    // Radius = farthest corner from origin
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = Math.max(x, w - x);
    const maxY = Math.max(y, h - y);
    const r = Math.hypot(maxX, maxY);

    overlay.style.setProperty("--circle-x", `${x}px`);
    overlay.style.setProperty("--circle-y", `${y}px`);
    overlay.style.setProperty("--circle-r", `${r}px`);

    // Force reflow so the browser registers initial clip-path
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    overlay.getBoundingClientRect();

    // Trigger animation to full radius
    overlay.classList.add("theme-circle-overlay--active");

    const DURATION = 700; // must match CSS

    window.setTimeout(() => {
      // Switch theme AFTER the ripple
      setTheme(toTheme);
      localStorage.setItem("theme", toTheme);

      if (toTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      overlay.remove();
    }, DURATION);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
