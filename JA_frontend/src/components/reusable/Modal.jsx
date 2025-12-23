import React from "react";
import Button from "./Button";

export function Modal({ title, children, onClose, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Button variant="link" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-4">{children}</div>

        {footer && (
          <div className="px-4 py-3 border-t flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
