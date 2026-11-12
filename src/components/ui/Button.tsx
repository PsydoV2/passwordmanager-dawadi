import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline" | "link";
type Size = "md" | "lg";

interface StyleProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Volle Breite. */
  block?: boolean;
  children: ReactNode;
}

function classes({ variant = "secondary", size = "md", block }: Omit<StyleProps, "children" | "icon">, extra?: string) {
  return [styles.button, styles[variant], styles[size], block ? styles.block : "", extra ?? ""].join(" ");
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement> & { ref?: Ref<HTMLButtonElement> };

export function Button({ variant, size, icon, block, children, className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 17} strokeWidth={1.9} />}
      {children}
    </button>
  );
}

type ButtonLinkProps = StyleProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Sieht aus wie ein Button, ist aber ein Link (Navigation statt Aktion). */
export function ButtonLink({ variant, size, icon, block, children, className, href, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={classes({ variant, size, block }, className)} {...rest}>
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 17} strokeWidth={1.9} />}
      {children}
    </Link>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Pflicht: beschreibt die Aktion für Screenreader. */
  label: string;
  size?: number;
}

/** Quadratischer Button nur mit Icon (z. B. Kopieren, Anzeigen). */
export function IconButton({ icon, label, size = 18, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${styles.iconButton} ${className ?? ""}`}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
