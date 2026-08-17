import { useEffect } from "react";

interface ScrollIntoViewOnOpenOptions {
  delay?: number;
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
}

// Scrolls the element with `elementId` into view every time `open` transitions
// to true (not just on mount) — e.g. an accordion section that should bring
// itself into the viewport when the user expands it. `delay` should roughly
// match however long the element's own open/expand transition takes, so it
// scrolls once the element has actually grown to its full height instead of
// while still mid-animation.
export function useScrollIntoViewOnOpen(
  elementId: string,
  open: boolean,
  {
    delay = 300,
    behavior = "smooth",
    block = "center",
  }: ScrollIntoViewOnOpenOptions = {},
) {
  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior, block });
    }, delay);
    return () => clearTimeout(timeout);
  }, [elementId, open, delay, behavior, block]);
}
