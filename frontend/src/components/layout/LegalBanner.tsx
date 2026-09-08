"use client";

import { useCurrentUser } from "@/lib/api";

// Exact wording imposed by Florine Pontaillac / validated by le directeur de
// cabinet (docs/mails/retour_version_1.md) — must not be reworded,
// shortened, or shrunk. Permanent: no dismiss/close control.
const LEGAL_BANNER_TEXT =
  "Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations.";

export function LegalBanner() {
  const user = useCurrentUser();

  // Espace candidat au sens large : visiteur pas encore identifié (couvre
  // /login et les pages d'erreur, vues avant authentification) ou candidat
  // connecté. Masqué pour RECRUITER/ADMIN une fois connectés.
  const isCandidateSpace = !user || user.role === "JOB_SEEKER";
  if (!isCandidateSpace) return null;

  return (
    <div className="bg-primary text-white text-center px-4 py-2.5 text-sm font-semibold">
      {LEGAL_BANNER_TEXT}
    </div>
  );
}
