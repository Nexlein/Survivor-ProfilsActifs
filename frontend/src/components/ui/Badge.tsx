import { ReactNode } from "react";

type BadgeVariant = "success" | "neutral" | "admin" | "vue" | "contact";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success text-white text-[13px] font-bold px-3.5 py-2 rounded-md",
  neutral: "bg-bg-secondary text-text-secondary text-[13px] font-semibold px-3.5 py-2 rounded-md",
  admin: "bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-sm",
  vue: "bg-chip-bg text-chip-text text-[11px] font-bold px-2 py-0.5 rounded-sm",
  contact: "bg-badge-contact-bg text-badge-contact-text text-[11px] font-bold px-2 py-0.5 rounded-sm",
};

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
};

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`inline-block font-heading ${variantClasses[variant]}`}>{children}</span>;
}
