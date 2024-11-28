"use client";

import Prism from "prismjs";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-gdscript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-java";
import "prismjs/components/prism-xml-doc";

export default function PrismLoader() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const lightThemeLink = "/styles/syntax-highlighting/prism-ghcolors.css";
    const darkThemeLink = "/styles/syntax-highlighting/prism-dracula.css";

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = resolvedTheme === "dark" ? darkThemeLink : lightThemeLink;
    link.id = "prism-theme";

    const existingLink = document.getElementById("prism-theme");
    if (existingLink) {
      document.head.removeChild(existingLink);
    }

    document.head.appendChild(link);

    Prism.highlightAll();

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [resolvedTheme]);

  return <div className="hidden"></div>;
}
