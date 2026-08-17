import React from "react";
import { cva } from "class-variance-authority";

// Bootstrap/custom-CSS button look, picked by name instead of hand-typing the
// same class string at every call site. `d-flex align-items-center gap-2` is
// every button's baseline layout (icon + label), so it's baked into the base
// class rather than repeated in className at each call site — callers only
// add what's actually different for them (justify-content-center,
// flex-shrink-0, text-start w-100, etc.) via `className`/`style`.
const buttonVariants = cva("btn d-flex align-items-center gap-2", {
  variants: {
    variant: {
      ghost: "btn-link nullstill-btn text-dark border-0",
      menuItem:
        "btn-link settings-menu-item rounded-0 text-dark text-start w-100",
      primary: "beregn-btn text-white",
      outline: "btn-outline-black btn-legg-til",
      iconCircle: "btn-dark rounded-circle shadow",
    },
  },
  defaultVariants: {
    variant: "ghost",
  },
});

// Padding scale — copied from the actual padding each size was already using
// (Beregn for "default", the icon/text ghost buttons for "sm"). Applied via
// style rather than a className so it always wins regardless of what else is
// in className, but only when `size` is actually passed — omit it entirely
// (as the settings-menu items and icon-only buttons do) to keep controlling
// padding yourself via className/style like before.
const SIZE_PADDING = {
  sm: "4px 8px",
  default: "10px 24px",
  lg: "14px 32px",
};

const Button = ({
  variant,
  size,
  className = "",
  style,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`${buttonVariants({ variant })} ${className}`.trim()}
    style={size ? { padding: SIZE_PADDING[size], ...style } : style}
    {...props}
  />
);

export default Button;
