import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "destructive" | "success";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  // Texte foncé (pas blanc) sur fond orange : le blanc sur #FF9900 ne donne
  // qu'un contraste de 2.14:1 (échec RGAA AA, minimum 4.5:1 exigé). Le texte
  // foncé sur ce même orange atteint 7.97:1 — la couleur de marque reste
  // inchangée, seul le texte change.
  primary: "bg-action text-text hover:bg-[#e68a00]",
  secondary: "bg-white border border-primary text-primary hover:bg-bg-secondary",
  destructive: "bg-white border border-error text-error hover:bg-[#fdf0ee]",
  success: "bg-success text-white hover:bg-[#156b40]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-6 py-3 text-[15px]",
  lg: "px-8 py-4 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const disabledClasses = "disabled:bg-border disabled:text-[#8891a3] disabled:border-transparent disabled:cursor-not-allowed disabled:hover:bg-border";

// Classes seules, à appliquer directement à un <Link>/<a> pour les CTA de
// navigation : imbriquer un <button> dans un <a> crée deux arrêts clavier
// pour un seul bouton visuel (il faut appuyer deux fois sur Tab) et produit
// du HTML invalide (bouton dans un lien), d'où ce helper plutôt qu'un
// <Link><Button/></Link>.
export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className = "") {
  return `inline-flex items-center justify-center rounded-md font-bold font-heading transition-all active:scale-[0.98] ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`rounded-md font-bold font-heading transition-all active:scale-[0.98] ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}
