"use client";

import { useEffect } from "react";

// Next.js interdit d'exporter `metadata` depuis un composant client — ce hook
// pose le titre d'onglet côté client pour les pages interactives (formulaires,
// dashboards, etc.) qui ne peuvent pas utiliser l'export serveur.
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — ProfilsActifs`;
  }, [title]);
}
