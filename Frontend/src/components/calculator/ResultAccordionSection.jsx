import React from "react";
import Accordion from "../Accordion";
import AccordionBadge from "../AccordionBadge";
import { useScrollIntoViewOnOpen } from "../../hooks/useScrollIntoViewOnOpen";

const ResultAccordionSection = ({
  id,
  logoSrc,
  title,
  open,
  onToggle,
  colors,
  badges,
  children,
}) => {
  useScrollIntoViewOnOpen(id, open);

  return (
    <Accordion
      id={id}
      itemStyle={{
        backgroundColor: "#fff",
        border: `1px solid ${open ? colors.border : "#dee2e6"}`,
      }}
      open={open}
      onToggle={onToggle}
    >
      <Accordion.Header
        className="result-accordion-toggle p-4"
        style={{
          backgroundColor: open ? colors.headerBg : "transparent",
          "--result-accordion-hover-bg": colors.headerBg,
        }}
      >
        <img
          src={logoSrc}
          alt=""
          style={{ width: "1.75rem", height: "auto", marginRight: "0.75rem" }}
        />
        {title}
        {/* Always rendered (even with no badges) — its ms-auto is what pushes the
            chevron to the far right; without this wrapper present, the chevron's
            own margin (Calculator.css's .result-accordion-toggle::after override)
            has nothing to push against and sits right after the title instead. */}
        <div className="ms-auto d-flex align-items-center gap-2">
          {badges &&
            badges.length > 0 &&
            badges.map((badge, index) => (
              <AccordionBadge
                key={index}
                style={{
                  backgroundColor: badge.backgroundColor,
                  color: badge.color,
                }}
              >
                {badge.text}
              </AccordionBadge>
            ))}
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <div style={{ backgroundColor: "#fff" }}>{children}</div>
      </Accordion.Body>
    </Accordion>
  );
};

export default ResultAccordionSection;
