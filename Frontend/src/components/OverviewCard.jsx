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
    <div className="p-4">{children}</div>
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

const Footer = ({ children }) => (
  <span className="small mt-3 d-block">{children}</span>
);

OverviewCard.Header = Header;
OverviewCard.Metric = Metric;
OverviewCard.Footer = Footer;

export default OverviewCard;
