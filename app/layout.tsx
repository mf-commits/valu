import type { Metadata } from "next";
import "./globals.css";

// Pile de polices système (pas de dépendance réseau au build, rendu net partout).
// Pour utiliser Google Fonts (Inter) à la place, réintroduis next/font/google.

export const metadata: Metadata = {
  title: "Signature de contrat en ligne",
  description: "Signez votre contrat de services en ligne, en toute sécurité.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-CA">
      <body className="min-h-screen font-sans antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
