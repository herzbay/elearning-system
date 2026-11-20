"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

    useEffect(() => {
    const savedTheme = localStorage.getItem("eduflow_theme");

    const initialTheme =
        savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    setMounted(true);
}, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );

    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("eduflow_theme", theme);
  }, [theme, mounted]);

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme harus digunakan di dalam ThemeProvider.");
  }

  return context;
}