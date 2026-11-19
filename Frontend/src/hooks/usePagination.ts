import { useEffect, useState } from "react";

// Six fills three rows of the two-column result grid, which is about as much as sits under
// an accordion heading without the section running away down the page.
export const DEFAULT_PAGE_SIZE = 6;

// What the Pagination control needs to draw itself, kept together so a caller hands it over
// in one piece rather than threading five props through by hand.
export interface PagerProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  setPage: (page: number) => void;
}

export interface PaginationResult<T> {
  pageItems: T[];
  pager: PagerProps;
}

// Splits a list into pages and hands back the current one.
//
// A list that fits on one page comes back whole with a pageCount of 1, and the control
// draws nothing at that size, so a caller pages its list unconditionally instead of
// branching on the length itself.
// `resetKey` is whatever the list belongs to, the calculation result in this app's case.
// Pass it and any new one starts the reader at page 1, which the length alone cannot
// deliver, since a second calculation very often returns exactly as many påstander as the
// first and would otherwise leave the reader looking at page 3 of a result they have not
// seen page 1 of.
export function usePagination<T>(
  items: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
  resetKey?: unknown,
): PaginationResult<T> {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Keyed on the length and on resetKey, never on the array. A caller that builds its list
  // inline, as the helsepåstand section does when it concatenates two of them, hands over a
  // new array on every render, and keying on that would reset the page on every render with
  // it.
  useEffect(() => setPage(1), [total, pageSize, resetKey]);

  // Clamped rather than trusted. The effect above runs after the render that shortened the
  // list, so for one paint `page` can still point past the end, and what that paint shows is
  // an empty grid.
  const current = Math.min(page, pageCount);

  return {
    pageItems: items.slice((current - 1) * pageSize, current * pageSize),
    pager: { page: current, pageCount, total, pageSize, setPage },
  };
}
