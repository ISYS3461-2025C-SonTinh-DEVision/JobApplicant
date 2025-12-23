import React from "react";

export function Button({
  children,
  icon: Icon,
  label,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    /* Primary action: Apply, Save, Confirm */
    primary:
      "bg-[#2563EB] text-white hover:bg-[#1D4ED8] " +
      "focus-visible:ring-[#2563EB]",

    /* Secondary action: Cancel, Back */
    secondary:
      "bg-[#F5F7FA] text-[#0F172A] border border-[#E2E8F0] " +
      "hover:bg-[#EFF6FF] focus-visible:ring-[#CBD5E1]",

    /* Destructive: Admin-only actions */
    destructive:
      "bg-red-600 text-white hover:bg-red-700 " +
      "focus-visible:ring-red-500",

    /* Warning / attention (rarely used) */
    warning:
      "bg-amber-400 text-[#0F172A] hover:bg-amber-500 " +
      "focus-visible:ring-amber-400",

    /* Inline / subtle navigation */
    link:
      "bg-transparent text-[#2563EB] hover:text-[#1D4ED8] " +
      "underline-offset-4 hover:underline focus-visible:ring-[#2563EB]",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10",
  };

  const styles = [
    base,
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={styles}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2 shrink-0" />}
      {label || children}
    </button>
  );
}

export default Button;
