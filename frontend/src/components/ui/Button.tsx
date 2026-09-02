import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline-light";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-action text-white hover:bg-[#e68a00]",
  secondary: "bg-white border border-primary text-primary hover:bg-bg-secondary",
  destructive: "bg-white border border-error text-error hover:bg-[#fdf0ee]",
  "outline-light": "bg-transparent border border-white text-white hover:bg-white/10",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const disabledClasses = "disabled:bg-border disabled:text-[#8891a3] disabled:border-transparent disabled:cursor-not-allowed disabled:hover:bg-border";

  return (
    <button
      disabled={disabled}
      className={`rounded-md px-6 py-3 font-bold text-[15px] font-heading transition-colors ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}
