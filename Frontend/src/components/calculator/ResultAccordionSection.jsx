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
        // The section's tone, published once here for anything inside the body that has to
        // match it. The pager's current page reads these, which saves threading the colours
        // through every section component to reach a control three levels down. The tone at
        // full strength rather than the tint the count badge in this header wears, because
        // the page the reader is on has to be told apart from the grey chips beside it, and
        // a tint of the neutral tone is the same shade as those chips.
        "--result-tone-bg": colors.strongBg,
        "--result-tone-color": "#fff",
        "--result-tone-border": colors.strongBg,
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
