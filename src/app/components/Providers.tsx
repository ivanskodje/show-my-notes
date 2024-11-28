"use client";

import { NotFoundProvider } from "@/app/components/context/NotFoundContext";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>
        <NotFoundProvider>{children}</NotFoundProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
