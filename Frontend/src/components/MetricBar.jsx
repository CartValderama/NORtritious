import React from "react";

// One column of a small bar chart. The figure above it, the column itself drawn to that
// figure's share of the whole, and the caption under it.
//
// The sibling of CircularProgress, for a card with two figures to show rather than one. Two
// rings read as two unrelated dials, since nothing says the circles are the same circle,
// while two columns standing on one baseline can be compared by looking at them.
//
// `percentage` is passed in rather than worked out from the figure, so the caller keeps the
// decision of what the whole is. It is not always this column plus the next, and a kategori
// with no påstander at all has a share of nothing rather than a share of zero.
const MetricBar = ({
  caption,
  value,
  percentage,
  color,
  valueColor,
  // A floor for that plot, for a card too short to give the chart any room of its own.
  minPlotHeight = "4rem",
}) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const share = clamped / 100;

  return (
    // flex-basis 0 under a shared max, so the two columns stay the same width as each other
    // at every card width and shrink together instead of one pushing the other out. Wider
    // than the column it holds, which is what keeps a caption of a few words on one line.
    <div
      className="d-flex flex-column align-items-center"
      style={{ flex: "1 1 0", maxWidth: "7rem" }}
    >
      {/* The plot area, which takes whatever height the card has going spare. A height the
          two columns share is what puts them on one baseline, since each column stands at
          the bottom of its own box, and the figure rides on top of its own column rather
          than in a row of its own.

          The column is sized by splitting the plot between an empty spacer and the column
          itself, in the ratio the figure stands for, rather than by giving the column a
          percentage of the plot. A percentage would have to resolve against a parent whose
          own height comes from flex-grow, which Chrome works out against the height the
          parent had before it grew: the columns came out at the size they would have been
          in a plot that never stretched.

          The figure sat inside the column for a moment instead, white on the green and
          dark grey on the pale one. Putting it back is not just a matter of moving the
          span into the bar: a column shorter than about 2rem cannot hold a 1.35rem figure,
          so it needs the placement decided per column, inside where there is room and on
          top where there is not, and a colour for each of the two placements. */}
      <div
        className="d-flex flex-column align-items-center flex-grow-1"
        style={{ width: "100%", minHeight: minPlotHeight }}
      >
        <div style={{ flex: `${1 - share} 1 0`, minHeight: 0 }} />
        <span
          className="fw-bold lh-1 mb-1"
          style={{
            fontSize: "1.35rem",
            color: valueColor || color,
            flexShrink: 0,
          }}
        >
          {value}
        </span>
        <div
          style={{
            width: "100%",
            maxWidth: "4rem",
            flex: `${share} 1 0`,
            // So a figure of none still leaves a mark on the baseline rather than
            // disappearing and taking the axis with it.
            minHeight: "3px",
            backgroundColor: color,
            borderRadius: "0.25rem 0.25rem 0 0",
            transition: "flex-grow 0.3s ease, background-color 0.3s ease",
          }}
        />
      </div>
      {/* The same small as the verdict line under the other two overview cards, so the
          three of them read at one size. */}
      <span className="small text-muted lh-sm mt-2">{caption}</span>
    </div>
  );
};

export default MetricBar;
