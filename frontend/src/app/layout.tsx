import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const marianne = localFont({
  variable: "--font-marianne",
  src: [
    { path: "../fonts/marianne/Marianne-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/marianne/Marianne-Regular_Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/marianne/Marianne-Medium.woff2", weight: "600", style: "normal" },
    { path: "../fonts/marianne/Marianne-Medium_Italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/marianne/Marianne-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/marianne/Marianne-Bold_Italic.woff2", weight: "700", style: "italic" },
  ],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ProfilsActifs",
  description: "Plateforme de mise en relation professionnelle par vidéo — Ministère du Job et Bonheur",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`h-full ${marianne.variable} ${spectral.variable}`}>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
