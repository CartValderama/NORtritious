import React from "react";
import Accordion from "../../Accordion";
import AccordionBadge from "../../AccordionBadge";
import { useScrollIntoViewOnOpen } from "../../../hooks/useScrollIntoViewOnOpen";

const ResultAccordionSection = ({
  id,
  logoSrc,
  title,
  open,
  onToggle,
  colors,
  badgeText,
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
        {badgeText && (
          <AccordionBadge
            style={{
              backgroundColor: colors.badgeBg,
              color: colors.badgeColor,
            }}
          >
            {badgeText}
          </AccordionBadge>
        )}
      </Accordion.Header>
      <Accordion.Body>
        <div style={{ backgroundColor: "#fff" }}>{children}</div>
      </Accordion.Body>
    </Accordion>
  );
};

export default ResultAccordionSection;
