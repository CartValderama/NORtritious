import React from "react";

// Single-item Bootstrap accordion shell — shared by "Hvordan bruke
// kalkulatoren" (uncontrolled, pure Bootstrap JS) and "Beregn for
// helsepåstander" (React-controlled via `open`/`onToggle`, since its open
// state also drives the EFSA panel mount and the button's own corner
// radius). Both hand-rolled the same accordion/accordion-item/
// accordion-header/accordion-button/accordion-collapse skeleton and
// data-bs-toggle wiring before this was extracted.
const BsAccordionItem = ({
  id,
  itemClassName = "",
  itemStyle,
  buttonClassName = "",
  buttonStyle,
  header,
  open,
  onToggle,
  children,
}) => {
  const collapseId = `${id}Collapse`;
  const controlled = open !== undefined;
  const collapsed = controlled ? !open : true;

  return (
    <div className="accordion" id={id}>
      <div
        className={`accordion-item overflow-hidden ${itemClassName}`}
        style={itemStyle}
      >
        <h2 className="accordion-header">
          <button
            type="button"
            className={`accordion-button ${collapsed ? "collapsed" : ""} ${buttonClassName}`}
            style={buttonStyle}
            data-bs-toggle="collapse"
            data-bs-target={`#${collapseId}`}
            aria-expanded={controlled ? open : false}
            aria-controls={collapseId}
            onClick={onToggle}
          >
            {header}
          </button>
        </h2>
        <div
          id={collapseId}
          className="accordion-collapse collapse"
          data-bs-parent={`#${id}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default BsAccordionItem;
