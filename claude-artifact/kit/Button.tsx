import React from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "ghost" | "secondary" | "destructive" | "link";
type Size = "sm" | "md" | "lg" | "icon-md" | "icon-lg";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");

export const Button = React.forwardRef<HTMLButtonElement, Props>(({ variant = "primary", size = "md", asChild, className, children, type, ...rest }, ref) => {
  const cls = cx(styles.btn, styles[variant], styles[size === "icon-md" ? "iconMd" : size === "icon-lg" ? "iconLg" : size], className);
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, { className: cx(cls, child.props.className) } as never);
  }
  return (
    <button ref={ref} type={type ?? "button"} className={cls} {...rest}>
      {children}
    </button>
  );
});
Button.displayName = "Button";
