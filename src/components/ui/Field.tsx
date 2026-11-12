"use client";

import { useState, type InputHTMLAttributes } from "react";
import { IconButton } from "./Button";
import styles from "./Field.module.css";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  /** Hervorgehobener Rahmen für das Hauptfeld einer Seite. */
  emphasis?: boolean;
}

/** Passwortfeld mit Button zum Anzeigen/Verbergen. Standard: verborgen. */
export function PasswordInput({ value, onChange, invalid, emphasis, className, ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const wrapClass = [styles.inputWrap, emphasis ? styles.emphasis : "", invalid ? styles.invalid : "", className ?? ""].join(" ");
  return (
    <div className={wrapClass}>
      <input
        {...rest}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        spellCheck={false}
        autoCapitalize="off"
        className={`${styles.bare} mono`}
      />
      <IconButton
        icon={visible ? "eyeOff" : "eye"}
        label={visible ? "Passwort verbergen" : "Passwort anzeigen"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        size={20}
      />
    </div>
  );
}
