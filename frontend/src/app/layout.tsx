import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProfilsActifs",
  description: "Plateforme de mise en relation professionnelle par vidéo — Ministère du Job et Bonheur",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
