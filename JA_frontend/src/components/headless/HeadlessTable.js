import { useState } from "react";

export default function HeadlessTable({
  defaultSortKey,
  defaultDirection = "asc",
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [direction, setDirection] = useState(defaultDirection);

  const toggleSort = (key) => {
    if (key === sortKey) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  return {
    sortKey,
    direction,
    toggleSort,
  };
}
