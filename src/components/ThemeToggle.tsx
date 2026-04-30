import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Күндізгі режимге ауыстыру" : "Түнгі режимге ауыстыру"}
      title={isDark ? "Күндізгі режим" : "Түнгі режим"}
      className={`p-2 rounded-md hover:text-primary hover:bg-secondary transition ${className}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
