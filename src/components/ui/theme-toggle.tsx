"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label={isDark ? "Passer en thème clair" : "Passer en thème sombre"}
      title="Changer de thème"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <span className="relative block size-4">
        <Sun
          className="absolute inset-0 size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
        />
        <Moon
          className="absolute inset-0 size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
        />
      </span>
    </Button>
  );
}
