import { InputHTMLAttributes } from "react";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Radio({ label, id, className = "", ...props }: RadioProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-[13px] font-heading text-text cursor-pointer">
      <input
        id={id}
        type="radio"
        className={`w-4 h-4 accent-primary ${className}`}
        {...props}
      />
      {label}
    </label>
  );
}
