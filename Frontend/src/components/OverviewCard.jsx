import React from "react";

// Generic white card — icon+title header, arbitrary content, no footer.
// Used for the three "Nøkkelhullet / Ernæringspåstander / Helsepåstander"
// summary boxes at the top of NutritionResult, but not specific to them.
// Compound component: <OverviewCard.Header/> (logo+title), an optional
// <OverviewCard.Metric/> (centered square slot for a ring or a big number),
// and <OverviewCard.Footer/> (verdict text) — the three all follow the same
// header/metric/footer shape, just with different metric content.
const OverviewCard = ({ children }) => (
  <div
    className="rounded-2 bg-white d-flex flex-column text-center flex-grow-1"
    style={{
      border: "1px solid rgba(0, 0, 0, 0.06)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
      flexBasis: 0,
      minWidth: "200px",
    }}
  >
    {/* A flex column, so a metric that can use more room than it asks for is able to take
        it. The header and the footer size to their content either way. */}
    <div className="p-4 d-flex flex-column flex-grow-1">{children}</div>
  </div>
);

const Header = ({ logoSrc, title }) => (
  <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
    <img src={logoSrc} alt="" style={{ width: "1.5rem", height: "auto" }} />
    <span
      className="fw-bold text-nowrap"
      style={{ fontSize: "clamp(0.7rem, 2.5vw, 1rem)" }}
    >
      {title}
    </span>
  </div>
);

const Metric = ({ children }) => (
  <div
    className="d-flex align-items-center justify-content-center mx-auto"
    style={{ width: "100%", maxWidth: "7rem", aspectRatio: "1 / 1" }}
  >
    {children}
  </div>
);

// The metric slot for a card that shows a bar chart instead of a ring or a single figure.
// Holds at least the vertical room Metric's square takes, so the three cards in a row line
// up, and then takes whatever else the card has going spare. On a card with no footer line
// that is the footer's room as well, which the columns grow into rather than leaving a gap
// under the chart.
//
// The columns stretch to the full height of the row, which is what lets each one find the
// same baseline. A caption long enough to wrap would push its own column's baseline up; at
// two or three words, as the pair of them are, none does.
const BarMetric = ({ children }) => (
  <div
    className="d-flex justify-content-center gap-3 flex-grow-1"
    style={{ minHeight: "7rem" }}
  >
    {children}
  </div>
);

const Footer = ({ children }) => (
  <span className="small mt-3 d-block">{children}</span>
);

OverviewCard.Header = Header;
OverviewCard.Metric = Metric;
OverviewCard.BarMetric = BarMetric;
OverviewCard.Footer = Footer;

export default OverviewCard;
