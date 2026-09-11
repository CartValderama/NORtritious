import React from "react";
import { Modal } from "react-bootstrap";
import { MATVAREGRUPPER } from "../../utils/calculator/kostradene";
import { useKostradeneStore } from "../../stores/kostradeneStore";

// Helsedirektoratets kostholdsråd, as reference material. Nothing here is calculated or
// checked: the advice is about a whole diet over time, while the calculator judges one
// product's numbers against labelling thresholds. It is a dialog rather than another panel in
// the form for exactly that reason, since a panel would read as another thing to fill in.
//
// Only the per-food-group table for now. The seven summarised kostråd and their detail
// paragraphs still live in kostradene.ts, unrendered.
const KostradeneModal = () => {
  const show = useKostradeneStore((s) => s.showKostradene);
  const onHide = useKostradeneStore((s) => s.closeKostradene);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="mvt-modal-dialog"
      contentClassName="kostrad-modal-content"
    >
      <Modal.Header className="px-4 py-3" closeButton>
        <Modal.Title
          as="h2"
          className="fs-4 mb-0 d-flex align-items-center gap-2"
        >
          <i className="bi bi-clipboard2-heart" style={{ fontSize: "1.5rem" }} />
          Kostholdsråd
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="kostrad-body p-4">
        <p className="text-muted mb-4">
          Helsedirektoratets generelle råd om et sunt kosthold. De gjelder
          kostholdet over tid, ikke det enkelte produktet, og inngår derfor ikke
          i beregningen.
        </p>

        <h3 className="fs-6 fw-bold mb-3">Anbefaling for hver matvaregruppe</h3>
        <div className="kostrad-table-frame">
          <table className="table align-middle mb-0 kostrad-table">
            <thead>
              <tr>
                <th scope="col">Matvaregruppe</th>
                <th scope="col">Anbefaling</th>
              </tr>
            </thead>
            <tbody>
              {MATVAREGRUPPER.map((rad) => (
                <tr key={rad.group}>
                  <th scope="row" className="fw-semibold">
                    {rad.group}
                  </th>
                  <td>{rad.advice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      {/* Attribution only. There is nothing to confirm or cancel here, and the header's ×
          already closes it, so a Lukk button was a second way to do the same thing. */}
      <Modal.Footer className="px-4 py-3">
        <span className="text-muted small me-auto">
          Kilde: Helsedirektoratet
        </span>
      </Modal.Footer>
    </Modal>
  );
};

export default KostradeneModal;
