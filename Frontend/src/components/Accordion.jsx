import React, { createContext, useContext, useEffect, useRef, useState } from "react";

// Compound component: <Accordion><Accordion.Header/><Accordion.Body/></Accordion>.
// Header/Body read shared state (collapse id, open/collapsed, the toggle
// handler) from context instead of it being threaded through props — same
// shape as react-bootstrap's own Breadcrumb/Breadcrumb.Item. General-purpose,
// not calculator-specific — usable anywhere a single Bootstrap accordion item
// is needed (uncontrolled, pure Bootstrap JS collapse) or a fully
// React-controlled one (open/onToggle) is needed.
const AccordionContext = createContext(null);

const useAccordionContext = (component) => {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`Accordion.${component} must be rendered inside an Accordion`);
  }
  return ctx;
};

const Accordion = ({
  id,
  itemClassName = "",
  itemStyle,
  open,
  onToggle,
  children,
}) => {
  const collapseId = `${id}Collapse`;
  const controlled = open !== undefined;
  const collapsed = controlled ? !open : true;
  // Bootstrap's own collapse animation (~0.35s) ignores any toggle attempt
  // while one is already in flight — but our React `open` state doesn't know
  // that, so without this, rapid clicking flips `open` on every click
  // regardless of whether Bootstrap actually acted on it, letting React's
  // idea of open/closed drift out of sync with what's really on screen.
  // `settledOpen` mirrors Bootstrap's own last-confirmed state (updated only
  // by its shown.bs.collapse/hidden.bs.collapse events) purely so the click
  // handler below can detect "a transition is still in flight" and ignore
  // extra clicks until it finishes — keeping `open` reliable enough that text
  // and colors can stay driven by it directly, changing instantly on click
  // instead of waiting for the animation to finish.
  const [settledOpen, setSettledOpen] = useState(open ?? false);
  const collapseRef = useRef(null);

  useEffect(() => {
    const el = collapseRef.current;
    if (!el) return undefined;
    const handleShown = () => setSettledOpen(true);
    const handleHidden = () => setSettledOpen(false);
    el.addEventListener("shown.bs.collapse", handleShown);
    el.addEventListener("hidden.bs.collapse", handleHidden);
    return () => {
      el.removeEventListener("shown.bs.collapse", handleShown);
      el.removeEventListener("hidden.bs.collapse", handleHidden);
    };
  }, []);

  return (
    <AccordionContext.Provider
      value={{
        parentId: id,
        collapseId,
        open,
        controlled,
        collapsed,
        settledOpen,
        onToggle,
        collapseRef,
      }}
    >
      <div
        className={`accordion ${itemClassName}`}
        id={id}
        style={{ boxShadow: itemStyle?.boxShadow }}
      >
        <div
          className={`accordion-item overflow-hidden ${itemClassName}`}
          style={{ ...itemStyle, boxShadow: undefined }}
        >
          {children}
        </div>
      </div>
    </AccordionContext.Provider>
  );
};

const Header = ({ className = "", style, children }) => {
  const { collapseId, open, controlled, collapsed, settledOpen, onToggle } =
    useAccordionContext("Header");

  // Ignore clicks while a transition is still in flight (open hasn't caught
  // up to settledOpen yet) — see the comment on `settledOpen` above. Bootstrap
  // itself already ignores the click in this case; this just keeps React's
  // `open` from getting ahead of it too. Only meaningful in controlled mode —
  // uncontrolled accordions have no `open`/`onToggle` to guard in the first
  // place, Bootstrap's own JS handles everything there.
  const handleClick = (e) => {
    if (controlled && open !== settledOpen) return;
    onToggle?.(e);
  };

  return (
    <h2 className="accordion-header">
      <button
        type="button"
        className={`accordion-button ${collapsed ? "collapsed" : ""} ${className}`}
        style={style}
        data-bs-toggle="collapse"
        data-bs-target={`#${collapseId}`}
        aria-expanded={controlled ? open : false}
        aria-controls={collapseId}
        onClick={handleClick}
      >
        {children}
      </button>
    </h2>
  );
};

const Body = ({ children }) => {
  const { parentId, collapseId, collapseRef } = useAccordionContext("Body");

  return (
    <div
      ref={collapseRef}
      id={collapseId}
      className="accordion-collapse collapse"
      data-bs-parent={`#${parentId}`}
    >
      {children}
    </div>
  );
};

// Right-side open/closed indicator, as an icon that swaps instantly on click
// instead of Bootstrap's default chevron. Omit this entirely to keep the
// chevron — that's the only option that works in uncontrolled mode, since a
// manual icon swap needs live React state, which doesn't exist there
// (Bootstrap's JS drives the DOM directly and React never sees it). `boxed`
// wraps the icon in a bordered addon box instead of rendering it bare — pair
// with a header className of "p-0 d-flex align-items-stretch
// justify-content-between" so it fills the button's full height and sits
// flush against the right edge.
const Indicator = ({
  boxed = false,
  openIcon = "bi-x-lg",
  closedIcon = "bi-plus-lg",
  className = "",
  style,
}) => {
  const { open, controlled } = useAccordionContext("Indicator");

  if (!controlled) {
    throw new Error(
      "Accordion.Header.Indicator needs a controlled Accordion (pass open/onToggle) — " +
        "in uncontrolled mode, omit Indicator and let Bootstrap's default chevron handle it instead.",
    );
  }

  const icon = <i className={`bi ${open ? openIcon : closedIcon}`} />;

  if (!boxed) return icon;

  return (
    <span
      className={`d-flex align-items-center justify-content-center px-3 efsa-accordion-icon-addon ${className}`}
      style={{ paddingTop: "0.875rem", paddingBottom: "0.875rem", ...style }}
    >
      {icon}
    </span>
  );
};

// Header text that swaps instantly on click.
const Label = ({ open: openLabel, closed: closedLabel }) => {
  const { open, controlled } = useAccordionContext("Label");

  if (!controlled) {
    throw new Error(
      "Accordion.Header.Label needs a controlled Accordion (pass open/onToggle) — " +
        "in uncontrolled mode there's no live state to pick between the two labels.",
    );
  }

  return open ? openLabel : closedLabel;
};

Header.Indicator = Indicator;
Header.Label = Label;

Accordion.Header = Header;
Accordion.Body = Body;

export default Accordion;
