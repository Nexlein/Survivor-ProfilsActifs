import { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  wrapperClassName?: string;
};

export function Checkbox({ label, id, className = "", wrapperClassName = "", ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex gap-2 text-[13px] font-heading text-text cursor-pointer ${wrapperClassName || "items-center"}`}
    >
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
