import { useState } from "react";

export default function HeadlessPagination({
  initialPage = 1,
  pageSize = 10,
  totalItems = 0,
}) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setPage((p) => Math.max(p - 1, 1)),
  };
}
