import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Apply theme immediately before React renders (avoids flash)
function applyTheme(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Read from localStorage synchronously on first render
    const saved = localStorage.getItem("theme");
    if (saved === "light") return false;
    if (saved === "dark") return true;
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply theme on mount and whenever isDark changes
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const next = !isDark;
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="liquid-link-button p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none"
      aria-label="Toggle Theme"
      id="theme-toggle-btn"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
