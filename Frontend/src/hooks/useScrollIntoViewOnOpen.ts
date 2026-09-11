import { useEffect } from "react";

interface ScrollIntoViewOnOpenOptions {
  delay?: number;
  behavior?: ScrollBehavior;
  offset?: number;
  block?: Extract<ScrollLogicalPosition, "start" | "center">;
}

// Brings the element with `elementId` into view when `open` transitions to true (not just on
// mount), the way an accordion section shows itself as the user expands it.
//
// It scrolls only when the element isn't already fully on screen. Note that "fully" is the
// operative word: an earlier version skipped whenever the element's *top* was visible, which
// meant it never scrolled at all for these accordions. The body opens directly beneath the
// header the user just clicked, so its top edge is on screen by definition, while the part
// that just appeared is off the bottom, which is the whole reason to scroll.
//
// `block` differs by what is being opened, which is why it is a parameter rather than a
// constant. The form panels are shorter than a screen, so centring them reads best. The
// result sections are not: centring is computed from the element's height, so one taller than
// the viewport gets its middle centred and its heading pushed off the top, and the
// health-claims results run to well over a screen. Those anchor to the top instead.
export function useScrollIntoViewOnOpen(
  elementId: string,
  open: boolean,
  {
    // Longer than Bootstrap's 350ms collapse, so the element is measured at its settled
    // height. Measuring mid-animation reads it as shorter than it ends up and can conclude it
    // fits on screen when it doesn't.
    delay = 400,
    behavior = "smooth",
    offset = 16,
    block = "start",
  }: ScrollIntoViewOnOpenOptions = {},
) {
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const { top, bottom } = element.getBoundingClientRect();
      const fullyVisible = top >= 0 && bottom <= window.innerHeight;
      // Taller than the viewport and already sitting where the scroll would put it: moving it
      // by a pixel or two is worse than leaving it alone.
      const alreadyPlaced = block === "start" && Math.abs(top - offset) < 4;
      if (fullyVisible || alreadyPlaced) return;

      // scrollIntoView honours scroll-margin-top, which is how a top-anchored element ends up
      // just below the viewport edge rather than flush against it. Meaningless when centring.
      if (block === "start") element.style.scrollMarginTop = `${offset}px`;
      element.scrollIntoView({ behavior, block });
    }, delay);
    return () => clearTimeout(timeout);
  }, [elementId, open, delay, behavior, offset, block]);
}
