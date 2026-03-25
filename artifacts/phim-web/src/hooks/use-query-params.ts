import { useSearch } from "wouter";
import { useMemo } from "react";

export function useQueryParams() {
  const searchString = useSearch();
  
  return useMemo(() => {
    return new URLSearchParams(searchString);
  }, [searchString]);
}
