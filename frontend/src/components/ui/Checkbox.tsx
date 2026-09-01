import { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-[13px] text-text cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className={`w-4 h-4 accent-primary ${className}`}
        {...props}
      />
      {label}
    </label>
  );
}
