import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Accordion from "../Accordion";
import MatvaretabellenModal from "./MatvaretabellenModal";
import matvaretabellenLogo from "../../assets/img/matvaretabellenLogo.svg";
import { formatNoNumber } from "../../utils/calculator/nutritionFormFields";

// Placeholder home for the Matvaretabellen integration — picking a food here
// doesn't feed the calculator's nutrition fields yet, it just records which
// food was picked.
const MatvaretabellenAccordion = () => {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState([]);

  // The modal opens pre-checked with whatever's already selected (via
  // alreadySelected below) and hands back the full edited set on save — a
  // plain replace, not a merge, so unchecking something in the modal removes
  // it here too.
  const handleSave = (foods) => {
    setSelectedFoods(foods);
    setShowModal(false);
  };

  const handleRemove = (foodId) => {
    setSelectedFoods((prev) => prev.filter((f) => f.foodId !== foodId));
  };

  return (
    <div style={{ marginBottom: "2.25rem" }}>
      <Accordion
        id="matvaretabellenAccordion"
        itemClassName="rounded-2"
        open={open}
        onToggle={() => setOpen((v) => !v)}
      >
        <Accordion.Header
          className="efsa-accordion-toggle d-flex align-items-center gap-2 px-4 py-3"
          style={
            open
              ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
              : {}
          }
        >
          <img
            src={matvaretabellenLogo}
            alt="Matvaretabellen"
            style={{
              width: "1.4rem",
              height: "auto",
              transform: open ? "rotate(360deg)" : "rotate(0deg)",
              transition: open ? "transform 0.5s ease-in-out" : "none",
            }}
          />
          <Accordion.Header.Label
            open="Skjul Matvaretabellen"
            closed="Matvaretabellen"
          />
        </Accordion.Header>
        <Accordion.Body>
          <div className="p-4 d-flex flex-column gap-2">
            <h3 className="fs-6 fw-semibold mb-1 d-flex align-items-center">
              Valgte matvarer
              <Tooltip
                title="Matvarer du har slått opp i Matvaretabellen, som referanse ved siden av beregningen under."
                placement="right"
                arrow
              >
                <i
                  className="bi bi-info-circle text-muted ms-2"
                  style={{ cursor: "help", fontSize: "0.85rem" }}
                />
              </Tooltip>
            </h3>
            {selectedFoods.map((food, index) => (
              <div
                key={food.foodId}
                className="mvt-food-item d-flex flex-column gap-3"
              >
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span className="d-flex align-items-center gap-2">
                    <i
                      className={`bi bi-${index + 1 <= 9 ? index + 1 : "9-plus"}-circle-fill flex-shrink-0`}
                      style={{ color: "#000000", fontSize: "1.1rem" }}
                    />
                    {food.foodName}
                  </span>
                  <button
                    type="button"
                    className="mvt-badge-remove"
                    onClick={() => handleRemove(food.foodId)}
                    title="Fjern valgt matvare"
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
                <div className="row g-2 nutrition-calc-fields">
                  <div className="col-6 col-md-3" style={{ minWidth: 0 }}>
                    <label className="form-label new-label-indent">
                      Energi
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        style={{ minWidth: 0 }}
                        placeholder="0"
                        defaultValue={formatNoNumber(food.energyKcal)}
                      />
                      <span className="input-group-text">kcal</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3" style={{ minWidth: 0 }}>
                    <label className="form-label new-label-indent">
                      Protein
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        style={{ minWidth: 0 }}
                        placeholder="0"
                        defaultValue={formatNoNumber(food.protein)}
                      />
                      <span className="input-group-text">g</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3" style={{ minWidth: 0 }}>
                    <label className="form-label new-label-indent">Fett</label>
                    <div className="input-group">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        style={{ minWidth: 0 }}
                        placeholder="0"
                        defaultValue={formatNoNumber(food.fat)}
                      />
                      <span className="input-group-text">g</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3" style={{ minWidth: 0 }}>
                    <label className="form-label new-label-indent">
                      Karbohydrat
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="form-control"
                        style={{ minWidth: 0 }}
                        placeholder="0"
                        defaultValue={formatNoNumber(food.carbs)}
                      />
                      <span className="input-group-text">g</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mvt-add-row py-3"
              onClick={() => setShowModal(true)}
            >
              <span className="mvt-row-add-btn">
                <i className="bi bi-plus-lg" />
              </span>
              {selectedFoods.length > 0
                ? "Legg til flere matvarer fra Matvaretabellen"
                : "Velg fra Matvaretabellen"}
            </button>
          </div>
        </Accordion.Body>
      </Accordion>

      <MatvaretabellenModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSelect={handleSave}
        alreadySelected={selectedFoods}
      />
    </div>
  );
};

export default MatvaretabellenAccordion;
