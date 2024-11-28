"use client";

import { Skeleton } from "@/app/shared/components/ui/Skeleton";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useLayoutEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <Skeleton className="h-5 w-5 bg-transparent" />;

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return resolvedTheme === "dark" ? (
    <Sun onClick={handleToggleTheme} />
  ) : (
    <Moon onClick={handleToggleTheme} />
  );
};

export default ThemeSwitcher;
