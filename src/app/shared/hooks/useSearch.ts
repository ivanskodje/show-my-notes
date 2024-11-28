import { parseAsString, useQueryState } from "nuqs";
import Fuse from "fuse.js";
import { useMemo, useState, useEffect } from "react";
import useDebounce from "@/app/shared/hooks/useDebounce";

export function useSearch<T>(items: T[], keys: string[], debounceTime: number = 300) {
  const [query, setQuery] = useQueryState("search", parseAsString.withDefault(""));
  const [filteredItems, setFilteredItems] = useState(items);
  const debouncedQuery = useDebounce(query, debounceTime);

  const fuse = useMemo(() => new Fuse(items, { keys, threshold: 0.3 }), [items, keys]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setFilteredItems(items);
    } else {
      const results = fuse.search(debouncedQuery).map((result) => result.item);
      setFilteredItems(results);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, items]);

  return { query, setQuery, filteredItems };
}
