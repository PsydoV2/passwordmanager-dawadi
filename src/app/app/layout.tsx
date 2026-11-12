import { AppGate } from "@/components/app/AppGate";
import { VaultProvider } from "@/controller/VaultContext";

/** Alle Seiten unter /app teilen sich den Tresor-Zustand (Controller) und die Zugangslogik. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <VaultProvider>
      <AppGate>{children}</AppGate>
    </VaultProvider>
  );
}
