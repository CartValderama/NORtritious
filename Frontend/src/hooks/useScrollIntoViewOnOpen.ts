import { useEffect } from "react";

interface ScrollIntoViewOnOpenOptions {
  delay?: number;
  behavior?: ScrollBehavior;
  offset?: number;
}

// Brings the element with `elementId` to the top of the viewport when `open` transitions to
// true (not just on mount) — an accordion section showing itself as the user expands it.
//
// Two things it deliberately doesn't do:
//
// It doesn't centre the element. That was the previous behaviour, and it put long sections in
// the wrong place: centring is computed from the height the element has at that moment, so a
// section taller than the viewport gets its middle centred and its heading pushed off the
// top. The health-claims results are the worst case, running to well over a screen. A top
// anchor lands the same way whether the section holds two cards or twenty.
//
// It doesn't scroll at all when the element's top edge is already on screen. Expanding
// something you are already looking at shouldn't move the page under you; the only case that
// needs a scroll is the one where the thing that just opened is somewhere you can't see.
export function useScrollIntoViewOnOpen(
  elementId: string,
  open: boolean,
  {
    delay = 300,
    behavior = "smooth",
    offset = 16,
  }: ScrollIntoViewOnOpenOptions = {},
) {
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      const element = document.getElementById(elementId);
      if (!element) return;

      const { top } = element.getBoundingClientRect();
      if (top >= 0 && top < window.innerHeight) return;

      // scrollIntoView honours scroll-margin-top, which is how the element ends up sitting
      // just below the viewport edge rather than flush against it.
      element.style.scrollMarginTop = `${offset}px`;
      element.scrollIntoView({ behavior, block: "start" });
    }, delay);
    return () => clearTimeout(timeout);
  }, [elementId, open, delay, behavior, offset]);
}
