import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Modération des profils" };

// Données de démonstration — aucune route de modération n'existe côté
// backend (voir résumé final).
const ROWS = [
  { name: "Julien Petit", email: "julien.petit@example.com", role: "Candidat", status: "En attente", date: "01/09/2026" },
  { name: "Lucie Bernard", email: "lucie.bernard@example.com", role: "Candidat", status: "En attente", date: "31/08/2026" },
  { name: "JEB Corp", email: "contact@jebcorp.com", role: "Recruteur", status: "Actif", date: "28/08/2026" },
];

export default function ModerationPage() {
  return (
    <main className="px-6 py-8">
      <h2 className="mb-4">Modération des profils</h2>

      <div className="flex gap-2 flex-wrap mb-4">
        <select className="border border-border rounded-md px-3 py-2 text-[13px]">
          <option>Tous statuts</option>
        </select>
        <select className="border border-border rounded-md px-3 py-2 text-[13px]">
          <option>Tous rôles</option>
        </select>
        <input
          placeholder="Date"
          className="border border-border rounded-md px-3 py-2 text-[13px]"
        />
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-x-auto">
        <div className="min-w-[760px]">
          {ROWS.map((row) => (
            <div
              key={row.email}
              className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
            >
              <div className="w-7 h-7 rounded-full bg-border shrink-0" />
              <div className="flex-1 min-w-[120px] font-semibold text-text">{row.name}</div>
              <div className="text-text-secondary min-w-[150px]">{row.email}</div>
              <div className="min-w-[80px]">{row.role}</div>
              <div className="min-w-[80px]">{row.status}</div>
              <div className="text-text-secondary min-w-[90px]">{row.date}</div>
              <Button variant="secondary" size="sm" className="shrink-0">
                Voir
              </Button>
              <Button variant="destructive" size="sm" className="shrink-0">
                Suspendre
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
