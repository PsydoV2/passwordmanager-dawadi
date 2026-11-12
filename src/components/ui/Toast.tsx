"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { IconButton } from "./Button";
import { Icon } from "./Icon";
import styles from "./Toast.module.css";

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

/** Kurze Rückmeldungen wie „Passwort kopiert“ unten in der Mitte. Verschwindet nach 4 Sekunden. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef(0);

  const show = useCallback<ShowToast>((text) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Der Live-Bereich bleibt immer im DOM, damit Screenreader neue Meldungen vorlesen. */}
      <div role="status" aria-live="polite" className={styles.region}>
        {message && (
          <div className={styles.toast}>
            <Icon name="check" size={18} strokeWidth={2} className={styles.icon} />
            <span>{message}</span>
            <IconButton
              icon="close"
              label="Hinweis schließen"
              size={16}
              className={styles.close}
              onClick={() => setMessage(null)}
            />
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
