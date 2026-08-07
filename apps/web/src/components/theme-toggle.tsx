import { MoonIcon, SunIcon } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      size="icon"
      variant="ghost"
    >
      <SunIcon className="dark:-rotate-90 size-4 rotate-0 scale-100 transition-transform dark:scale-0" />
      <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
