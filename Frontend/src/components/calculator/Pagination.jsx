import React from "react";

// Pager for a list too long to show at once. Draws nothing when everything already fits, so
// the decision of whether a control is needed lives here and not in each caller.
//
// Every page gets its own number, and a number is the only control. The result sections
// run to a handful of pages at most, so the first/last-with-ellipsis machinery would be
// built for a case that never arrives, and a reader can see at a glance how much is still
// behind the fold as well as reach any of it in one click.
const Pagination = ({ page, pageCount, setPage, label, className = "" }) => {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div
      className={`d-flex flex-wrap align-items-center gap-3 ${className}`.trim()}
    >
      {/* A "Viser 1 til 6 av 17" line used to sit here. The numbered buttons already say
          where the reader is and how much is left, and the section heading carries the
          count, so it was a third telling of the same thing. Putting it back means taking
          `total` and `pageSize` into the props again, both of which the pager still
          receives from the hook.

          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            Viser {(page - 1) * pageSize + 1} til {Math.min(page * pageSize, total)} av{" "}
            {total}
          </span> */}

      <nav aria-label={label}>
        <ul className="pagination pagination-sm result-pagination flex-wrap mb-0">
          {/* A chevron sat on each end, stepping one page at a time. With every page
              already a button away there was nothing they reached that a number did not,
              and the two of them were half the width of the control.

              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button type="button" className="page-link" aria-label="Forrige side"
                        onClick={() => setPage(page - 1)} disabled={page === 1}>
                  <i className="bi bi-chevron-left" />
                </button>
              </li>
              ... and after the numbers, the same with page + 1, pageCount and
              bi-chevron-right. */}

          {pages.map((n) => (
            <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage(n)}
                aria-label={`Side ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
