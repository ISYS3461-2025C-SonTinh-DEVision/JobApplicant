import React from "react";

export function Card({ children, hoverable = false, className = "" }) {
  return (
    <div
      className={[
        "bg-white rounded-lg border border-gray-200 p-4",
        hoverable && "hover:shadow-md transition-shadow",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default Card;
