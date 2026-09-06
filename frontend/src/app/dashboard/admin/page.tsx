"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonClasses } from "@/components/ui/Button";
import { AdminInteractionStats, getInteractionStats } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

// Profils actifs / taux de certification / vidéos publiées restent de la
// démonstration : aucune route d'agrégation n'existe encore pour elles
// côté backend (voir résumé final) — seul "Interactions ce mois" est
// branché sur le modèle Interaction.
const STATIC_KPIS = [
  { value: "1 248", label: "Profils actifs" },
  { value: "34%", label: "Taux de certification" },
  { value: "3 420", label: "Vidéos publiées" },
];

const WEEKLY_SIGNUPS = [40, 55, 35, 70, 60, 85, 50];

const MODERATION_QUEUE = [
  { name: "Julien Petit", date: "01/09/2026", status: "En attente" },
  { name: "Lucie Bernard", date: "31/08/2026", status: "En attente" },
];

export default function AdminDashboardPage() {
  usePageTitle("Tableau de bord admin");
  const [interactionsThisMonth, setInteractionsThisMonth] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInteractionStats()
      .then((res) => {
        if (!cancelled) setInteractionsThisMonth((res as AdminInteractionStats).interactionsThisMonth);
      })
      .catch(() => {
        /* KPI tile just falls back to a dash on failure */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    ...STATIC_KPIS,
    { value: interactionsThisMonth !== null ? String(interactionsThisMonth) : "—", label: "Interactions ce mois" },
  ];

  return (
    <main className="px-6 py-8">
      <h2 className="mb-5">Tableau de bord admin</h2>

      <div className="bg-[#FFF3E9] text-action rounded-lg px-4 py-3 text-[13px] font-semibold mb-5">
        15 profils attendent votre validation.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg p-4.5 shadow-card">
            <div className="text-xl font-extrabold text-primary font-heading">{kpi.value}</div>
            <div className="text-xs text-text-secondary">{kpi.label}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-3 hidden md:block">Nouvelles inscriptions par semaine</h3>
      <div className="hidden md:flex items-end gap-2.5 h-24 mb-8">
        {WEEKLY_SIGNUPS.map((value, i) => (
          <div
            key={i}
            className="w-7 bg-primary"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h3>Profils en attente de modération</h3>
        <Link href="/admin/moderation" className={buttonClasses("secondary", "sm")}>
          Voir tout
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-card overflow-x-auto">
        <div className="min-w-[560px]">
          {MODERATION_QUEUE.map((item) => (
            <div
              key={item.name}
              className="flex gap-3 items-center px-4 py-3 border-b border-border last:border-b-0 flex-nowrap text-[13px]"
            >
              <div className="flex-1 min-w-[120px] font-semibold text-text">{item.name}</div>
              <div className="text-text-secondary min-w-[90px]">{item.date}</div>
              <div className="min-w-[90px]">{item.status}</div>
              <Button variant="success" size="sm" className="shrink-0">
                Valider
              </Button>
              <Button variant="destructive" size="sm" className="shrink-0">
                Rejeter
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
