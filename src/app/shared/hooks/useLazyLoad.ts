import { useEffect, useState } from "react";

export function useLazyLoad<T>(items: T[], initialCount: number, increment: number) {
  const [visibleItems, setVisibleItems] = useState<T[]>(items.slice(0, initialCount));
  const [visibleCount, setVisibleCount] = useState(initialCount);

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [items, initialCount]);

  useEffect(() => {
    setVisibleItems(items.slice(0, visibleCount));
  }, [items, visibleCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        setVisibleCount((prev) => Math.min(prev + increment, items.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, increment]);

  return visibleItems;
}
