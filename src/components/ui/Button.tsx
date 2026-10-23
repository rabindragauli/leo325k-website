import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-dark"
  | "outline-strong"
  | "text";
export type ButtonSize = "md" | "lg";

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string };

const variants: Record<ButtonVariant, string> = {
  primary: "bg-yellow text-teal-900 hover:brightness-105",
  secondary: "bg-teal-900 text-white hover:bg-teal-700",
  outline: "border border-line bg-white text-teal-900 hover:border-teal-400",
  /** On dark/gradient bands (404 hero) */
  "outline-dark": "border border-on-dark-muted text-white hover:bg-teal-700",
  /** On yellow panels (About CTA) */
  "outline-strong": "border-2 border-teal-900 text-teal-900 hover:bg-white/30",
  text: "text-teal-900 underline underline-offset-4 hover:text-teal-700",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 rounded-btn px-[18px] py-2.5 text-[15px]",
  lg: "min-h-[54px] rounded-[12px] px-6 py-3 text-[17px]",
};

/** Shared classes so links and buttons look identical. */
export function buttonClasses({ variant = "primary", size = "md", className }: StyleProps = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-extrabold transition",
    variant === "text" ? "min-h-11 px-0.5 font-bold" : cn(sizes[size], "no-underline"),
    variants[variant],
    className,
  );
}

function Arrow({ variant }: { variant: ButtonVariant }) {
  return variant === "text" ? <span aria-hidden="true">→</span> : null;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...props
}: ComponentProps<"button"> & StyleProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      <Arrow variant={variant} />
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & StyleProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      <Arrow variant={variant} />
    </Link>
  );
}
