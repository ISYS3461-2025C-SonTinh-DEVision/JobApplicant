import React from "react";

export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  disabled = false,
  className = "",
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[
          "h-10 px-3 rounded-md border text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#2c4270]",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300",
          disabled && "bg-gray-100 cursor-not-allowed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export default Input;
