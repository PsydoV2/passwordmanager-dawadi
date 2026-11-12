import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/app/ServiceWorker";
import "./globals.css";

// Schriften werden beim Build heruntergeladen und mit der App ausgeliefert (funktioniert auch offline).
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Latch – Passwort-Manager",
  description: "Passwort-Manager, der deine Zugangsdaten verschlüsselt nur auf deinem Gerät speichert.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Latch", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f2ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1512" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
