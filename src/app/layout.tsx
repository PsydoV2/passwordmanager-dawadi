import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latch – Passwort-Manager",
  description: "Passwort-Manager, der deine Zugangsdaten verschlüsselt nur auf deinem Gerät speichert.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
