import { useState } from "react";

export default function HeadlessSearch(initialFilters = {}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return {
    query,
    setQuery,
    filters,
    updateFilter,
    resetFilters,
  };
}
