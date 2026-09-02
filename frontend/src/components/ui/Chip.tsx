import { ReactNode } from "react";

type ChipProps = {
  children: ReactNode;
  onRemove?: () => void;
};

export function Chip({ children, onRemove }: ChipProps) {
  if (onRemove) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-chip-bg text-chip-text text-[13px] font-semibold px-3 py-1.5 rounded-full font-heading">
        {children}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Retirer ${children}`}
          className="leading-none"
        >
          ✕
        </button>
      </span>
    );
  }

  return (
    <span className="inline-block bg-primary text-white text-[13px] font-semibold px-3.5 py-1.5 rounded-full font-heading">
      {children}
    </span>
  );
}
