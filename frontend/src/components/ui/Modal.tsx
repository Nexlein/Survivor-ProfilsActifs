"use client";

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    return () => {
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-10 p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleKeyDown}
        className="bg-bg rounded-lg p-6 w-[360px] max-w-full shadow-modal"
      >
        <h3 id="modal-title" className="mb-2.5">
          {title}
        </h3>
        <div className="text-[13px] text-text-secondary mb-4">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
