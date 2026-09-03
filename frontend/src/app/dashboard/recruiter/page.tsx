import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Tableau de bord recruteur" };

// Statistiques et contacts de démonstration — aucune route backend n'existe
// encore pour agréger ces données (voir résumé final).
const STATS = [
  { value: "47", label: "Profils consultés ce mois" },
  { value: "12", label: "Favoris enregistrés" },
  { value: "8", label: "Messages envoyés" },
];

const CONTACTS = [
  { name: "Marie Dupont", sector: "Assistanat", score: "87/100", date: "12/08/2026", status: "Répondu" },
  { name: "Karim Belkacem", sector: "Logistique", score: "74/100", date: "10/08/2026", status: "En attente" },
];

export default function RecruiterDashboardPage() {
  return (
    <main className="px-6 py-8">
      <h2 className="mb-5">Tableau de bord recruteur</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-4.5 shadow-card">
            <div className="text-2xl font-extrabold text-primary font-heading">{stat.value}</div>
            <div className="text-[13px] text-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3">Mes contacts récents</h3>
      <div className="bg-white rounded-lg shadow-card overflow-x-auto">
        <div className="min-w-[720px]">
          {CONTACTS.map((contact) => (
            <div
              key={contact.name}
              className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
            >
              <div className="w-8 h-8 rounded-full bg-border shrink-0" />
              <div className="flex-1 min-w-[120px] font-semibold text-text">{contact.name}</div>
              <div className="text-text-secondary min-w-[100px]">{contact.sector}</div>
              <div className="text-primary font-semibold min-w-[70px]">{contact.score}</div>
              <div className="text-text-secondary min-w-[90px]">{contact.date}</div>
              <div className="min-w-[90px]">{contact.status}</div>
              <Button variant="secondary" size="sm" className="shrink-0">
                Voir le profil
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
