import { InputHTMLAttributes } from "react";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
};

export function Switch({ label, id, className = "", ...props }: SwitchProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-[13px] text-text cursor-pointer">
      {label}
      <span className="relative inline-block w-10 h-5.5">
        <input
          id={id}
          type="checkbox"
          className={`peer sr-only ${className}`}
          {...props}
        />
        <span className="absolute inset-0 rounded-full bg-border peer-checked:bg-primary transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2" />
        <span className="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white transition-transform peer-checked:translate-x-4.5" />
      </span>
    </label>
  );
}
