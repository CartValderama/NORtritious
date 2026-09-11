import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Tooltip from "@mui/material/Tooltip";
import { searchMatvaretabellenFoods } from "../../services/matvaretabellenService";
import { formatNoNumber } from "../../utils/calculator/nutritionFormFields";
import matvaretabellenLogo from "../../assets/img/matvaretabellenLogo.svg";
import Button from "../Button";

const PAGE_SIZE = 6;

// Search dialog over Mattilsynet's Matvaretabellen. Opens with a default page
// of foods already loaded (no query needed), and "Vis flere" asks the backend
// for the next batch — the dataset has 2000+ entries, so the frontend never
// holds more than what's been paged in.
const MatvaretabellenModal = ({
  show,
  onHide,
  onSelect,
  alreadySelected = [],
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [picked, setPicked] = useState([]);

  // Each time the modal opens, start from whatever's already been saved so
  // reopening it shows those as checked instead of forgetting them.
  useEffect(() => {
    if (show) setPicked(alreadySelected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const togglePicked = (food) => {
    setPicked((prev) =>
      prev.some((f) => f.foodId === food.foodId)
        ? prev.filter((f) => f.foodId !== food.foodId)
        : [...prev, food],
    );
  };

  const handleSave = () => {
    onSelect(picked);
  };

  const runSearch = async (q) => {
    setLoading(true);
    try {
      const res = await searchMatvaretabellenFoods(q.trim(), 1, PAGE_SIZE);
      setResults(res.items);
      setPage(1);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Matvaretabellen search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return undefined;
    const handle = setTimeout(() => runSearch(query), query ? 300 : 0);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, query]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await searchMatvaretabellenFoods(
        query.trim(),
        nextPage,
        PAGE_SIZE,
      );
      setResults((prev) => [...prev, ...res.items]);
      setPage(nextPage);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Matvaretabellen load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleExited = () => {
    setQuery("");
    setResults([]);
    setPage(1);
    setHasMore(false);
  };

  // Picked foods stay pinned at the top of the table across searches — a
  // fresh query replaces `results`, but anything already picked shouldn't
  // vanish from view just because it's not part of the current search.
  const pinnedPicked = picked.filter(
    (p) => !results.some((r) => r.foodId === p.foodId),
  );
  const rows = [...pinnedPicked, ...results];

  return (
    <Modal
      show={show}
      onHide={onHide}
      onExited={handleExited}
      centered
      size="lg"
      dialogClassName="mvt-modal-dialog"
      contentClassName="mvt-modal-content"
    >
      <Modal.Header className="px-4 py-3" closeButton>
        <Modal.Title
          as="h2"
          className="fs-4 mb-0 d-flex align-items-center gap-2"
        >
          <img
            src={matvaretabellenLogo}
            alt=""
            style={{ width: "1.75rem", height: "auto" }}
          />
          Matvaretabellen
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="mvt-modal-body p-4">
        <p className="text-muted mb-3 flex-shrink-0">
          Mattilsynets offisielle Matvaretabellen for å slå opp referanseverdier
          for næringsinnhold per 100 g/ml.
        </p>
        <div className="d-flex gap-2 mb-3 flex-shrink-0">
          <div className="position-relative flex-grow-1">
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 mvt-search-icon" />
            <input
              type="text"
              className="form-control mvt-search-input"
              placeholder="Søk etter en matvare, f.eks. «kyllingfilet»"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(query);
              }}
              autoComplete="off"
              autoFocus
            />
          </div>
          <button
            type="button"
            className="btn mvt-search-btn flex-shrink-0 d-inline-flex align-items-center justify-content-center gap-2"
            onClick={() => runSearch(query)}
          >
            <i className="bi bi-search" />
            <span className="d-none d-md-inline">Søk</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted py-4">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
            Laster…
          </div>
        ) : (
          <div className="mvt-modal-results">
            <div className="mvt-modal-table-frame">
              <div className="mvt-modal-table-scroll">
                <table className="table table-hover align-middle mb-0 mvt-modal-table">
                  <thead>
                    <tr>
                      <th scope="col" className="mvt-row-add-col" />
                      <th scope="col">Matvare</th>
                      <th scope="col">Energi</th>
                      <th scope="col" className="d-none d-md-table-cell">
                        Protein
                      </th>
                      <th scope="col" className="d-none d-md-table-cell">
                        Fett
                      </th>
                      <th scope="col" className="d-none d-md-table-cell">
                        Karbo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-muted">
                          Ingen treff
                        </td>
                      </tr>
                    )}
                    {rows.map((food) => {
                      const isPicked = picked.some(
                        (f) => f.foodId === food.foodId,
                      );
                      return (
                        <tr
                          key={food.foodId}
                          role="button"
                          tabIndex={0}
                          onClick={() => togglePicked(food)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              togglePicked(food);
                            }
                          }}
                          className="mvt-row-clickable"
                        >
                          <td className="mvt-row-add-col">
                            <span
                              className={`mvt-row-add-btn${isPicked ? " mvt-row-add-btn-active" : ""}`}
                            >
                              <i
                                className={`bi ${isPicked ? "bi-check-lg" : "bi-plus-lg"}`}
                              />
                            </span>
                          </td>
                          <td>
                            <Tooltip
                              title={food.foodName}
                              placement="top"
                              arrow
                            >
                              <span className="mvt-food-name">
                                {food.foodName}
                              </span>
                            </Tooltip>
                          </td>
                          <td className="text-muted">
                            {formatNoNumber(food.energyKcal)} kcal
                          </td>
                          <td className="text-muted d-none d-md-table-cell">
                            {formatNoNumber(food.protein)} g
                          </td>
                          <td className="text-muted d-none d-md-table-cell">
                            {formatNoNumber(food.fat)} g
                          </td>
                          <td className="text-muted d-none d-md-table-cell">
                            {formatNoNumber(food.carbs)} g
                          </td>
                        </tr>
                      );
                    })}
                    {hasMore && (
                      <tr>
                        <td colSpan={6} className="mvt-loadmore-cell">
                          <button
                            type="button"
                            className="mvt-loadmore-row"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                          >
                            {loadingMore ? (
                              "Laster…"
                            ) : (
                              <>
                                Vis flere
                                <i className="bi bi-chevron-down" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="px-4 py-3">
        <span className="text-muted small me-auto">
          {picked.length > 0 ? `${picked.length} valgt` : "Ingen valgt"}
        </span>
        <div className="mvt-modal-actions">
          <Button
            variant="ghost"
            className="mvt-modal-action"
            onClick={onHide}
          >
            <i className="bi bi-x-lg" />
            Avbryt
          </Button>
          <button
            type="button"
            className="btn mvt-search-btn mvt-modal-action d-flex align-items-center gap-2"
            onClick={handleSave}
          >
            <i className="bi bi-check-lg" />
            Lagre
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default MatvaretabellenModal;
