import { useState } from "react";

export default function HeadlessModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  return {
    open,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
    toggleModal: () => setOpen((prev) => !prev),
  };
}
