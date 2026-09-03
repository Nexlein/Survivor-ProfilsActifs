"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { usePageTitle } from "@/lib/use-page-title";

type NotificationItem = {
  id: string;
  icon: string;
  message: string;
  meta: string;
  read: boolean;
  kind: "view" | "contact";
  action?: string;
};

// Données de démonstration — aucun modèle/route "Notification" n'existe côté
// backend (voir résumé final). Le modèle Interaction existe mais n'est pas
// exposé par l'API.
const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    icon: "👁",
    message: "Entreprise Martin & Associés a consulté votre profil",
    meta: "il y a 2h",
    read: false,
    kind: "view",
  },
  {
    id: "2",
    icon: "✉",
    message: "Sophie Durand de TechCorp vous a envoyé un message",
    meta: "il y a 5h",
    read: false,
    kind: "contact",
    action: "Voir le message",
  },
  {
    id: "3",
    icon: "👁",
    message: "RH Solutions a consulté votre profil",
    meta: "il y a 1 jour",
    read: true,
    kind: "view",
  },
];

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "unread", label: "Non lues" },
  { id: "seen", label: "Vues" },
  { id: "contact", label: "Contacts" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export default function NotificationsPage() {
  usePageTitle("Notifications");
  const [filter, setFilter] = useState<FilterId>("all");

  const notifications = DEMO_NOTIFICATIONS.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    if (filter === "seen") return n.kind === "view";
    if (filter === "contact") return n.kind === "contact";
    return true;
  });

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="mb-4">Mes notifications</h2>
      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-md text-sm font-semibold font-heading border ${
              filter === f.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-text border-border"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {notifications.length === 0 && (
          <p className="text-text-secondary text-sm">Aucune notification pour ce filtre.</p>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg p-3.5 flex gap-3 items-start ${
              n.read ? "bg-white border border-border" : "bg-chip-bg"
            }`}
          >
            <span className={n.kind === "contact" ? "text-action text-lg" : "text-primary text-lg"}>
              {n.icon}
            </span>
            <div className="flex-1">
              <p className={`text-sm m-0 ${n.read ? "text-text-secondary" : "text-text"}`}>
                {n.message}
              </p>
              <p className="text-xs text-text-secondary mt-1">{n.meta}</p>
              {n.action && (
                <Button variant="primary" size="sm" className="mt-1.5">
                  {n.action}
                </Button>
              )}
            </div>
            {n.kind === "view" && !n.read && <Badge variant="vue">Vue</Badge>}
            {n.kind === "contact" && <Badge variant="contact">Contact</Badge>}
          </div>
        ))}
      </div>
    </main>
  );
}
