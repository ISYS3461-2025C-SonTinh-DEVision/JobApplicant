/**
 * Tag Component - Updated for Dark/Light mode support
 * 
 * Used for displaying skill tags, status badges, etc.
 * Supports both dark and light themes with proper contrast.
 */
import React from "react";

export function Tag({ label, variant = "default", size = "sm", isDark = false, onRemove }) {
  // Light mode variants
  const lightVariants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    primary: "bg-primary-50 text-primary-700 border border-primary-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    skill: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  // Dark mode variants - with proper contrast for dark backgrounds
  const darkVariants = {
    default: "bg-dark-700/60 text-dark-200 border border-dark-600",
    primary: "bg-primary-500/20 text-primary-300 border border-primary-500/30",
    success: "bg-green-500/20 text-green-300 border border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-300 border border-red-500/30",
    skill: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  };

  const variants = isDark ? darkVariants : lightVariants;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
        sizeClasses[size] || sizeClasses.sm,
        variants[variant] || variants.default,
      ].join(" ")}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Tag;
