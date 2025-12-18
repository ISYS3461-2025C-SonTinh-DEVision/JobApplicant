import React from "react";

export function Tag({ label, variant = "default", onRemove }) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-[#2c4270]/10 text-[#2c4270]",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        variants[variant],
      ].join(" ")}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-xs hover:opacity-70"
        >
          ×
        </button>
      )}
    </span>
  );
}

export default Tag;
